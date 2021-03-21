from django.contrib import admin
from django.contrib.auth.models import Group, User
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from workflowAPI.models import State,Transition,CustomGroup,TransitionHistory,Notification
# Register your models here.
@admin.register(State)
class CircuitStates(admin.ModelAdmin):
    list_display=['name']


@admin.register(Transition)
class Transitions(admin.ModelAdmin):
    list_display=['name','from_state','to_state']
    
@admin.register(TransitionHistory)
class TransitionHistories(admin.ModelAdmin):
    readonly_fields = ('id','transition_author','transition_time','circuit','from_state','to_state')
    list_display=['id','circuit','transition_author','transition_time','from_state','to_state']

class GroupInline(admin.TabularInline):
    model = CustomGroup
    can_delete = False
    verbose_name_plural = 'custom groups'

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