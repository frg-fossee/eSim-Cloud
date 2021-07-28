import traceback
from .serializers import consumerSerializer, consumerResponseSerializer, \
    SubmissionSerializer, GetSubmissionsSerializer, consumerExistsSerializer
from .utils import consumers, get_reverse, message_identifier
from .models import ltiSession, lticonsumer, Submission
from saveAPI.models import StateSave
from simulationAPI.models import simulation
from drf_yasg.utils import swagger_auto_schema
from django.conf import settings
from saveAPI.serializers import StateSaveSerializer
from django.views import View
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.shortcuts import render
from pylti.common import LTIException, verify_request_common, post_message, \
    generate_request_xml, LTIPostMessageException


def denied(r):
    return render(r, 'ltiAPI/denied.html')


class LTIExist(APIView):

    def get(self, request, save_id):
        try:
            consumer = lticonsumer.objects.get(
                Q(model_schematic__save_id=save_id) |
                Q(initial_schematic__save_id=save_id))
        except lticonsumer.DoesNotExist:
            return Response(data={"error": "LTIConsumer Not found"},
                            status=status.HTTP_404_NOT_FOUND)
        host = request.get_host()
        save_id = str(save_id)
        init_sch_serialized = StateSaveSerializer(
            instance=consumer.initial_schematic)
        model_sch_serialized = StateSaveSerializer(
            instance=consumer.model_schematic)
        config_url = "http://" + host + "/api/lti/auth/" + save_id + "/"
        response_data = {
            "consumer_key": consumer.consumer_key,
            "secret_key": consumer.secret_key,
            "config_url": config_url,
            "score": consumer.score,
            "initial_schematic": init_sch_serialized.data,
            "model_schematic": model_sch_serialized.data,
            "test_case": consumer.test_case.id if consumer.test_case else None,
            "scored": consumer.scored,
            "id": consumer.id
        }
        return Response(response_data,
                        status=status.HTTP_200_OK)


class LTIAllConsumers(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        saves = StateSave.objects.filter(owner=self.request.user)
        consumers = []
        for save in saves:
            if save.model_schematic.all().first():
                consumers.append(consumerExistsSerializer(
                    save.model_schematic.all().first()).data)
        return Response(consumers,
                        status=status.HTTP_200_OK)


class LTIBuildApp(APIView):

    @swagger_auto_schema(request_body=consumerSerializer,
                         responses={201: consumerResponseSerializer})
    def post(self, request):
        serialized = consumerSerializer(data=request.data)
        temp = lticonsumer.objects.filter(
            initial_schematic=request.data['model_schematic']
        ).count()
        if temp > 0:
            return Response(data={"error": "Model schematic cannot be initial \
                                  schematic for other LTI apps"},
                            status=status.HTTP_400_BAD_REQUEST)
        if serialized.is_valid():
            serialized.save()
            id = serialized.data.get("initial_schematic")
            if id is not None:
                saved_state = StateSave.objects.get(id=id)
                saved_state.shared = True
                saved_state.save()
                host = request.get_host()
                url = "http://" + host + "/api/lti/auth/" + \
                    str(saved_state.save_id) + "/"
                response_data = {
                    "consumer_key": serialized.data.get('consumer_key'),
                    "secret_key": serialized.data.get('secret_key'),
                    "config_url": url,
                    "score": serialized.data.get('score'),
                    "initial_schematic": str(serialized.data[
                        "initial_schematic"]),
                    "model_schematic": str(serialized.data["model_schematic"]),
                    "test_case": serialized.data['test_case'],
                    "scored": serialized.data['scored'],
                    "id": serialized.data['id']
                }
                print("Recieved POST for LTI APP:", response_data)
                response_serializer = consumerResponseSerializer(
                    data=response_data
                )
                if response_serializer.is_valid():
                    return Response(response_serializer.data,
                                    status=status.HTTP_201_CREATED)
                else:
                    return Response(response_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Initial Schematic not provided"},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serialized.errors,
                            status=status.HTTP_400_BAD_REQUEST)


class LTIUpdateAPP(APIView):

    @swagger_auto_schema(request_body=consumerSerializer,
                         responses={201: consumerResponseSerializer})
    def post(self, request):
        serialized = consumerSerializer(data=request.data)
        try:
            consumer = lticonsumer.objects.get(id=request.data['id'])
        except lticonsumer.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if serialized.is_valid():
            try:
                sim = simulation.objects.get(
                    id=serialized.data.get('test_case'))
            except simulation.DoesNotExist:
                sim = None
            consumer.consumer_key = serialized.data.get('consumer_key')
            consumer.secret_key = serialized.data.get('secret_key')
            consumer.score = serialized.data.get('score')
            consumer.model_schematic = StateSave.objects.get(
                id=serialized.data.get('model_schematic'))
            consumer.initial_schematic = StateSave.objects.get(
                id=serialized.data.get('initial_schematic'))
            consumer.test_case = sim
            consumer.scored = serialized.data.get('scored')
            consumer.save()
            return Response(serialized.data, status=status.HTTP_200_OK)
        else:
            return Response(serialized.errors,
                            status=status.HTTP_400_BAD_REQUEST)


class LTIDeleteApp(APIView):

    def delete(self, request, id):
        queryset = lticonsumer.objects.all()
        try:
            consumer = queryset.get(model_schematic=id)
            consumer.delete()
            return Response(data={"Message": "Successfully deleted!"},
                            status=status.HTTP_204_NO_CONTENT)
        except lticonsumer.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class LTIConfigView(View):
    def get(self, request, save_id):
        try:
            saved_state = StateSave.objects.get(save_id=save_id)
        except StateSave.DoesNotExist:
            return render(request, 'ltiAPI/denied.html')
        if saved_state.shared:
            pass
        else:
            saved_state.shared = True
            saved_state.save()
        domain = self.request.get_host()
        launch_url = '%s://%s/%s' % (
            self.request.scheme, domain,
            settings.LTI_TOOL_CONFIGURATION.get('launch_url'))
        ctx = {
            'domain': domain,
            'launch_url': launch_url,
            'title': saved_state.name + ' and ' + str(saved_state.save_id),
            'description': str(saved_state.description),
            'course_navigation': settings.LTI_TOOL_CONFIGURATION.get(
                'course_navigation'
            ),
        }
        return render(request, 'ltiAPI/config.xml', context=ctx,
                      content_type='text/xml; charset=utf-8')


class LTIAuthView(APIView):
    """POST handler for the LTI login POST back call"""

    def post(self, request, save_id):
        params = {key: request.data[key] for key in request.data}
        consumers_dict = consumers()
        url = request.build_absolute_uri()
        headers = request.META
        # Define the redirect url
        host = request.get_host()
        _ = headers.pop('HTTP_COOKIE', None)
        if 'HTTP_SEC_FETCH_DEST' not in headers:
            headers['HTTP_SEC_FETCH_DEST'] = 'iframe'
        if 'HTTP_SEC_FETCH_MODE' not in headers:
            headers['HTTP_SEC_FETCH_MODE'] = 'navigate'
        if 'HTTP_SEC_FETCH_SITE' not in headers:
            headers['HTTP_SEC_FETCH_SITE'] = 'cross-site'
        print("params:", params)
        print("headers:", headers)
        print("host:", host)
        print("url:", url)
        ltikeys = ['user_id', 'lis_result_sourcedid',
                   'lis_outcome_service_url', 'oauth_nonce',
                   'oauth_timestamp', 'oauth_consumer_key',
                   'oauth_signature_method',
                   'oauth_version', 'oauth_signature']
        ltidata = {key: params.get(key) for key in ltikeys}
        lti_session = ltiSession.objects.create(**ltidata)
        print("Got POST for validating LTI consumer")
        try:
            i = lticonsumer.objects.get(consumer_key=request.data.get(
                'oauth_consumer_key'), initial_schematic__save_id=save_id
            )
            lti_session.lti_consumer = i
            lti_session.save()
        except lticonsumer.DoesNotExist:
            print("Consumer does not exist on backend")
            return HttpResponseRedirect(get_reverse('ltiAPI:denied'))
        print(i.initial_schematic.save_id)
        next_url = "http://" + host + "/eda/#editor?id=" + \
                   str(i.initial_schematic.save_id) + "&branch=" \
                   + str(i.initial_schematic.branch) + "&version=" \
                   + str(i.initial_schematic.version) \
                   + "&lti_id=" + str(lti_session.id) + "&lti_user_id=" + \
                   lti_session.user_id \
                   + "&lti_nonce=" + lti_session.oauth_nonce
        try:
            print("Got verification request")
            verify_request_common(consumers_dict, url,
                                  request.method, headers, params)
            print("Verified consumer")
            # grade = LTIPostGrade(params, request)
            return HttpResponseRedirect(next_url)
        except LTIException:
            traceback.print_exc()
            return HttpResponseRedirect(get_reverse('ltiAPI:denied'))


class LTIPostGrade(APIView):
    permission_classes = [AllowAny, ]

    @swagger_auto_schema(request_body=SubmissionSerializer)
    def post(self, request):
        """
        Post grade to LTI consumer using XML
        :param: score: 0 <= score <= 1. (Score MUST be between 0 and 1)
        :return: True if post successful and score valid
        :exception: LTIPostMessageException if call failed
        """
        try:
            lti_session = ltiSession.objects.get(
                id=request.data["ltisession"]["id"])
        except ltiSession.DoesNotExist:
            return Response(data={
                "error": "No LTI session exists for this ID"
            }, status=status.HTTP_400_BAD_REQUEST)
        consumer = lticonsumer.objects.get(id=lti_session.lti_consumer.id)
        schematic = StateSave.objects.get(save_id=request.data["schematic"])
        schematic.shared = True
        schematic.save()
        submission_data = {
            "project": consumer,
            "student": schematic.owner,
            "score": consumer.score,
            "ltisession": lti_session,
            "schematic": schematic
        }
        submission = Submission.objects.create(**submission_data)
        xml = generate_request_xml(
            message_identifier(), 'replaceResult',
            lti_session.lis_result_sourcedid, submission.score)
        msg = ""
        try:
            post = post_message(
                consumers(), lti_session.oauth_consumer_key,
                lti_session.lis_outcome_service_url, xml)
            if not post:
                msg = 'An error occurred while saving your score.\
                     Please try again.'
                raise LTIPostMessageException('Post grade failed')
            else:
                submission.lms_success = True
                submission.save()
                msg = 'Your score was submitted. Great job!'
                return Response(data={"message": msg},
                                status=status.HTTP_200_OK)

        except LTIException:
            submission.lms_success = False
            submission.save()
            return Response(data={"message": msg},
                            status=status.HTTP_400_BAD_REQUEST)


class GetLTISubmission(APIView):
    permission_classes = [IsAuthenticated, ]

    def get(self, request, consumer_key):
        consumer = lticonsumer.objects.get(consumer_key=consumer_key)
        submissions = consumer.submission_set.all()
        serialized = GetSubmissionsSerializer(submissions, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)
