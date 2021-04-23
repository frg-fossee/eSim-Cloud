from django.contrib import admin
from publishAPI.models import Publication, CircuitTag,TransitionHistory,Report

@admin.register(CircuitTag)
class CircuitTagAdmin(admin.ModelAdmin):
    list_display = ('tag', 'description')
    search_fields = ('tag', 'description')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display=('id','publication','report_time')
    readonly_fields=('publication','report_time','reporter','resolver')

class HistoryInline(admin.TabularInline):
    model = TransitionHistory
    readonly_fields = ('id','transition_author','transition_time','from_state','to_state')


@admin.register(Publication)
class CircuitAdmin(admin.ModelAdmin):
    inlines=[HistoryInline,]
    list_display = ('title',)

# @admin.register(Publish)
# class PublishAdmin(admin.ModelAdmin):
#     list_display = ('circuit_title', 'image_tag', 'published', 'reviewed_by')
