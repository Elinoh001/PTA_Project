# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserProfileViewSet, basename='userprofile')
router.register(r'services', views.ServiceViewSet, basename='service')
router.register(r'activites', views.ActiviteViewSet, basename='activite')
router.register(r'directions', views.DirectionViewSet, basename='direction')
router.register(r'pcop', views.PCOPEntryViewSet, basename='pcop')
router.register(r'divisions', views.DivisionViewSet, basename='division')
router.register(r'pcop', views.PCOPEntryViewSet, basename='pcop')
router.register(r'structures', views.StructureViewSet, basename='structure')
router.register(r'suivis', views.SuiviViewSet, basename='suivi')
# ✅ NOUVELLES ROUTES
router.register(r'objectifs-generaux', views.ObjectifGeneralViewSet, basename='objectifgeneral')
router.register(r'objectifs-specifiques', views.ObjectifSpecifiqueViewSet, basename='objectifspecifique')
router.register(r'resultats-attendus', views.ResultatAttenduViewSet, basename='resultatattendu')

urlpatterns = [
    # ✅ CORRECTION : Supprimer le premier 'api/' pour éviter le double niveau
    path('', include(router.urls)),
    
    # ✅ Routes API supplémentaires - sans le double 'api/'
    path('export-excel/', views.export_pta_excel, name='export-excel'),
    path('user-profile/', views.get_user_profile, name='user-profile'),
    path('create-user/', views.create_user_with_profile, name='create-user'),
    path('users/<int:user_id>/update-role/', views.update_user_role, name='update-user-role'),
    
    # ✅ Routes JWT pour l'authentification
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]