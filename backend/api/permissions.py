# permissions.py
from rest_framework import permissions

class RolePermission(permissions.BasePermission):
    """
    Permissions basées sur le rôle de l'utilisateur.
    Rôles possibles : admin, superviseur, user
    """

    def has_permission(self, request, view):
        # Vérifier d'abord l'authentification
        if not request.user or not request.user.is_authenticated:
            return False

        # Récupérer le profil utilisateur
        try:
            user_profile = request.user.userprofile
        except AttributeError:
            # Si pas de userprofile, vérifier si c'est un superuser
            return request.user.is_superuser

        # Superuser a tous les droits
        if request.user.is_superuser:
            return True

        # Rôle : Admin → tout permis
        if user_profile.role == 'admin':
            return True

        # Rôle : Superviseur → peut lire et créer/modifier mais pas supprimer
        if user_profile.role == 'superviseur':
            if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
                return True
            elif request.method in ['POST', 'PUT', 'PATCH']:  # Création et modification
                return True
            elif request.method == 'DELETE':  # Pas de suppression
                return False

        # Rôle : User → lecture seule
        if user_profile.role == 'user':
            return request.method in permissions.SAFE_METHODS

        # Par défaut, refuser
        return False

    def has_object_permission(self, request, view, obj):
        """
        Vérifie les permissions sur un objet précis (utile pour DELETE ou UPDATE).
        """
        # Vérifier d'abord l'authentification
        if not request.user or not request.user.is_authenticated:
            return False

        # Récupérer le profil utilisateur
        try:
            user_profile = request.user.userprofile
        except AttributeError:
            # Si pas de userprofile, vérifier si c'est un superuser
            return request.user.is_superuser

        # Superuser a tous les droits
        if request.user.is_superuser:
            return True

        # Lecture autorisée à tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True

        # Rôle : Admin → tout permis
        if user_profile.role == 'admin':
            return True

        # Rôle : Superviseur → peut modifier mais pas supprimer
        if user_profile.role == 'superviseur':
            if request.method in ['PUT', 'PATCH']:  # Modification autorisée
                return True
            elif request.method == 'DELETE':  # Suppression interdite
                return False

        # Rôle : User → pas de modification/suppression
        if user_profile.role == 'user':
            return False

        # Par défaut, refuser
        return False


class AdminOnlyPermission(permissions.BasePermission):
    """
    Permission réservée aux administrateurs seulement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser a tous les droits
        if request.user.is_superuser:
            return True

        try:
            user_profile = request.user.userprofile
            return user_profile.role == 'admin'
        except AttributeError:
            return False


class SuperviseurAndAdminPermission(permissions.BasePermission):
    """
    Permission pour superviseurs et administrateurs
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser a tous les droits
        if request.user.is_superuser:
            return True

        try:
            user_profile = request.user.userprofile
            return user_profile.role in ['admin', 'superviseur']
        except AttributeError:
            return False


class ReadOnlyPermission(permissions.BasePermission):
    """
    Permission lecture seule pour tous les utilisateurs authentifiés
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.method in permissions.SAFE_METHODS