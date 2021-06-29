from django.contrib import admin
from django.db.models.fields import IntegerField
from .models import runtimeStat
from django.db.models.functions import Trunc


class runtimStatAdmin(admin.ModelAdmin):

    list_display = ('exec_time', 'qty')
    readonly_fields = ('exec_time', 'qty')

    change_list_template = 'admin/runtimeStats.html'
    qty_hierarchy = 'qty'

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

        # summary_over_time = qs.annotate(
        #     period='exec_time'
        # ).values('qty').annotate('qty').order_by('qty')

        # summary_range = summary_over_time.aggregate(        
        #     low=min('qty'),
        #     high=max('qty'),
        # )
        # high = summary_range.get('high', 0)
        # low = summary_range.get('low', 0)

        # response.context_data['summary_over_time'] = list(
        #     qs
        #     .values('exec_time', 'qty')
        #     .order_by('qty')
        # )
        return response


admin.site.register(runtimeStat, runtimStatAdmin)
