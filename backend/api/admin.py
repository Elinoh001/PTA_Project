from django.contrib import admin 
from .models import UserProfile, Service, Activite, PCOPEntry, Structure, Suivi, ObjectifGeneral, ObjectifSpecifique, ResultatAttendu, Direction, Division

admin.site.register(UserProfile) 
admin.site.register(Service) 
admin.site.register(Activite) 
admin.site.register(ObjectifGeneral)
admin.site.register(ObjectifSpecifique)
admin.site.register(ResultatAttendu)  
admin.site.register(PCOPEntry) 
admin.site.register(Suivi)
admin.site.register(Direction)
admin.site.register(Division)
admin.site.register(Structure)
