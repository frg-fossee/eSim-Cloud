from django.contrib import admin
from publishAPI.models import Circuit, CircuitTag
from workflowAPI.models import TransitionHistory

@admin.register(CircuitTag)
class CircuitTagAdmin(admin.ModelAdmin):
    list_display = ('tag', 'description')
    search_fields = ('tag', 'description')

class HistoryInline(admin.TabularInline):
    model = TransitionHistory
    readonly_fields = ('id','transition_author','transition_time','from_state','to_state')


@admin.register(Circuit)
class CircuitAdmin(admin.ModelAdmin):
    inlines=[HistoryInline,]


# @admin.register(Publish)
# class PublishAdmin(admin.ModelAdmin):
#     list_display = ('circuit_title', 'image_tag', 'published', 'reviewed_by')
