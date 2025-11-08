"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api import views
from api.views import (
    UserProfileViewSet, ServiceViewSet, ResultatAttenduViewSet,
    ObjectifSpecifiqueViewSet, ObjectifGeneralViewSet, ActiviteViewSet,
    PCOPEntryViewSet, SuiviViewSet, DirectionViewSet, DivisionViewSet,
    export_pta_excel, get_user_profile, create_user_with_profile, update_user_role
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserProfileViewSet, basename='userprofile')
router.register(r'services', views.ServiceViewSet, basename='service')
router.register(r'activites', views.ActiviteViewSet, basename='activite')
router.register(r'suivis', views.SuiviViewSet, basename='suivi')
router.register(r'directions', views.DirectionViewSet, basename='direction')
router.register(r'pcop', views.PCOPEntryViewSet, basename='pcop')
router.register(r'structures', views.StructureViewSet, basename='structure')
router.register(r'divisions', views.DivisionViewSet, basename='division')
router.register(r'objectifs-generaux', views.ObjectifGeneralViewSet, basename='objectifgeneral')
router.register(r'objectifs-specifiques', views.ObjectifSpecifiqueViewSet, basename='objectifspecifique')
router.register(r'resultats-attendus', views.ResultatAttenduViewSet, basename='resultatattendu')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/export-excel/', export_pta_excel, name='export-excel'),
    path('api/user-profile/', get_user_profile, name='user-profile'),
    path('api/create-user/', create_user_with_profile, name='create-user'),
    path('api/users/<int:user_id>/update-role/', update_user_role, name='update-user-role'),
    
    # Login / Refresh JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



