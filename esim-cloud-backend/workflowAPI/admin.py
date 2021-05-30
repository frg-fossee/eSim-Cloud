from django.contrib import admin
from django.contrib.auth.models import Group, User
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from workflowAPI.models import State,Transition,CustomGroup,Notification,Permission
from publishAPI.models import TransitionHistory
# Register your models here.
@admin.register(State)
class CircuitStates(admin.ModelAdmin):
    list_display=['name']


@admin.register(Transition)
class Transitions(admin.ModelAdmin):
    list_display=['name','from_state','to_state']
    
@admin.register(TransitionHistory)
class TransitionHistories(admin.ModelAdmin):
    readonly_fields = ('id','transition_author','transition_time','from_state','to_state')
    list_display=['id','transition_author','transition_time','from_state','to_state']

@admin.register(Permission)
class PermissionsAdmin(admin.ModelAdmin):
    fieldsets=(
        (None,{
            'fields':('role',)
        }),
        ('View Permissions',{
            'classes': ('collapse',),
            'fields':('view_own_states','view_other_states',),
        }),
        ('Edit Permissions',{
            'classes': ('collapse',),
            'fields':('edit_own_states','edit_other_states',),
        }),
        ('Delete Permissions',{
            'classes': ('collapse',),
            'fields':('del_own_states','del_other_states',),
        }),
    )

class GroupInline(admin.TabularInline):
    model = CustomGroup
    can_delete = False
    # verbose_name_plural = 'custom groups'

class GroupAdmin(BaseGroupAdmin):
    inlines = (GroupInline, )
class NotifInline(admin.TabularInline):
    model = Notification
    can_delete=False


class UserAdmin(AuthUserAdmin):
    inlines=(NotifInline,)


#Re-reigister UserAdmin
admin.site.unregister(User)
admin.site.register(User,UserAdmin)



# Re-register GroupAdmin
admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)