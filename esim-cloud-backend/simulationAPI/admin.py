from django.contrib import admin
from .models import runtimeStat, Limit, simulation
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Max
from django.http import HttpResponseRedirect


class outputAdmin(admin.ModelAdmin):
    list_display = ['simulation_type', 'task_id', 'owner']


class runtimStatAdmin(admin.ModelAdmin):

    list_display = ('exec_time', 'qty')
    readonly_fields = ('exec_time', 'qty')

    change_list_template = 'admin/runtimeStats.html'
    qty_hierarchy = 'qty'

    def has_add_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(
            request,
            extra_context=extra_context,
        )

        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response

        total = 0
        for i in qs:
            total += i.qty

        response.context_data['summary'] = list(
            qs
            .values('exec_time', 'qty')
            .order_by('-qty')
        )
        response.context_data['summary_total'] = total

        chart_data = (
            runtimeStat.objects
            .values("exec_time")
            .annotate(y=Max("qty"))
            .order_by("exec_time")
        )
        """
        Since 3s is the default time limit, it will be shown in the
        TIME_LIMIT page in admin in case there are no changes.
        """
        TIME_LIMIT = 0
        limits = Limit.objects.all()
        if limits.exists():
            TIME_LIMIT = Limit.objects.all()[0].timeLimit
        response.context_data['TIME_LIMIT'] = TIME_LIMIT
        as_json = json.dumps(list(chart_data), cls=DjangoJSONEncoder)
        extra_context = extra_context or {"chart_data": as_json}
        response.context_data.update(extra_context)

        if request.method == "POST":
            limit = request.POST.get('limit')
            limits = Limit.objects.all()
            if limits.exists():
                lim = Limit.objects.all().first()
                lim.timeLimit = limit
                lim.save()
            else:
                lim = Limit(timeLimit=limit)
                lim.save()
            response.context_data['TIME_LIMIT'] = limit
            return HttpResponseRedirect(
                "/api/admin/simulationAPI/runtimestat/"
            )
        return response


admin.site.register(runtimeStat, runtimStatAdmin)
admin.site.register(simulation, outputAdmin)
# admin.site.register(Limit)
