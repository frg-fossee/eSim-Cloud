from xml.etree import ElementTree
from xml.etree.ElementTree import SubElement, Element
from .models import lticonsumer
from django.urls import reverse
from datetime import time


def consumers():
    """
    Gets consumer's map from config
    :return: consumers map
    """
    consumers = dict()
    consumers_queryset = lticonsumer.objects.all()
    for i in consumers_queryset:
        consumers[i.consumer_key] = {}
        consumers[i.consumer_key]['secret'] = i.secret_key
    return consumers


def message_identifier():
    return '{:.0f}'.format(time())


def lis_result_sourcedid(request):
    return request.data.get('lis_result_sourcedid', None)


def lis_outcome_service_url(request):
    return request.data.get('lis_outcome_service_url', None)


def oauth_consumer_key(request):
    return request.data.get('oauth_consumer_key', None)


def get_reverse(objs):
    return reverse(objs)


# def generate_request_xml(message_identifier_id, operation,
#                          lis_result_sourcedid, score, launch_url):
#     # pylint: disable=too-many-locals
#     """
#     Generates LTI 1.1 XML for posting result to LTI consumer.
#     :param message_identifier_id:
#     :param operation:
#     :param lis_result_sourcedid:
#     :param score:
#     :return: XML string
#     """
#     root = Element(u'imsx_POXEnvelopeRequest',
#                    xmlns=u'http://www.imsglobal.org/services/'
#                          u'ltiv1p1/xsd/imsoms_v1p0')
#
#     header = SubElement(root, 'imsx_POXHeader')
#     header_info = SubElement(header, 'imsx_POXRequestHeaderInfo')
#     version = SubElement(header_info, 'imsx_version')
#     version.text = 'V1.0'
#     message_identifier = SubElement(header_info,
#                                     'imsx_messageIdentifier')
#     message_identifier.text = message_identifier_id
#     body = SubElement(root, 'imsx_POXBody')
#     xml_request = SubElement(
#         body, '%s%s' % (operation, 'Request'))
#     record = SubElement(xml_request, 'resultRecord')
#
#     guid = SubElement(record, 'sourcedGUID')
#
#     sourcedid = SubElement(guid, 'sourcedId')
#     sourcedid.text = lis_result_sourcedid
#     if score is not None:
#         result = SubElement(record, 'result')
#         result_score = SubElement(result, 'resultScore')
#         language = SubElement(result_score, 'language')
#         language.text = 'en'
#         text_string = SubElement(result_score, 'textString')
#         text_string.text = score.__str__()
#         if launch_url:
#             result_data = SubElement(result, 'resultData')
#             lti_launch_url = SubElement(
#                 result_data, 'ltiLaunchUrl')
#             lti_launch_url.text = launch_url
#     ret = "<?xml version='1.0' encoding='utf-8'?>\n{}".format(
#         ElementTree.tostring(root, encoding='utf-8').decode('utf-8'))
#
#     return ret
