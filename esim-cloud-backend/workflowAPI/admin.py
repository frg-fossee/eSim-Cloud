from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from workflowAPI.models import State, Transition, CustomGroup, Permission
from publishAPI.models import TransitionHistory


# Register your models here.
@admin.register(State)
class CircuitStates(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Transition)
class Transitions(admin.ModelAdmin):
    list_display = ['name', 'from_state', 'to_state']


@admin.register(TransitionHistory)
class TransitionHistories(admin.ModelAdmin):
    readonly_fields = (
        'id','transition', 'transition_author', 'transition_time','reviewer_notes','is_done_by_reviewer' )
    list_display = ['id' , 'transition','transition_author', 'transition_time',]


@admin.register(Permission)
class PermissionsAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('role',)
        }),
        ('View Permissions', {
            'classes': ('collapse',),
            'fields': ('view_own_states', 'view_other_states',),
        }),
        ('Edit Permissions', {
            'classes': ('collapse',),
            'fields': ('edit_own_states',),
        }),
        ('Delete Permissions', {
            'classes': ('collapse',),
            'fields': ('del_own_states',),
        }),
    )


class GroupInline(admin.TabularInline):
    model = CustomGroup
    can_delete = False
    # verbose_name_plural = 'custom groups'


class GroupAdmin(BaseGroupAdmin):
    inlines = (GroupInline,)


# Re-register GroupAdmin
admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)
