from rest_framework import serializers 
from .models import UserProfile, Service, Activite, PCOPEntry, Suivi, ObjectifGeneral, ObjectifSpecifique, ResultatAttendu, Direction, Division, Structure

class UserProfileSerializer(serializers.ModelSerializer): 
    username = serializers.CharField(source='auth_user.username', read_only=True)
    email = serializers.EmailField(source='auth_user.email', read_only=True)

    class Meta: 
        model = UserProfile 
        fields = '__all__'

# ✅ NOUVEAUX SERIALIZERS POUR LA STRUCTURE ORGANISATIONNELLE
class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    divisions = DivisionSerializer(many=True, read_only=True)
    nb_divisions = serializers.IntegerField(source='divisions.count', read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'

class DirectionSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    nb_services = serializers.IntegerField(source='services.count', read_only=True)
    
    class Meta:
        model = Direction
        fields = '__all__'

class StructureSerializer(serializers.ModelSerializer):
    directions = DirectionSerializer(many=True, read_only=True)
    nb_directions = serializers.IntegerField(source='directions.count', read_only=True)  # Correction: 'direction' -> 'directions'

    class Meta:
        model = Structure
        fields = '__all__'
        
class PCOPEntrySerializer(serializers.ModelSerializer): 
    class Meta: 
        model = PCOPEntry 
        fields = '__all__'

# ✅ SERIALIZERS POUR LA STRUCTURE HIÉRARCHIQUE DES OBJECTIFS
class ResultatAttenduSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultatAttendu
        fields = '__all__'

class ObjectifSpecifiqueSerializer(serializers.ModelSerializer):
    resultats_attendus = ResultatAttenduSerializer(many=True, read_only=True)
    nb_resultats = serializers.IntegerField(source='resultats_attendus.count', read_only=True)
    
    class Meta:
        model = ObjectifSpecifique
        fields = '__all__'

class ObjectifGeneralSerializer(serializers.ModelSerializer):
    objectifs_specifiques = ObjectifSpecifiqueSerializer(many=True, read_only=True)
    nb_objectifs_specifiques = serializers.IntegerField(source='objectifs_specifiques.count', read_only=True)
    
    class Meta:
        model = ObjectifGeneral
        fields = '__all__'
        
class ActiviteSerializer(serializers.ModelSerializer): 
    # ✅ INFORMATIONS ORGANISATIONNELLES EN LECTURE
    structure_nom = serializers.CharField(source='structure.nom', read_only=True)
    structure_numero = serializers.CharField(source='structure.numero', read_only=True)
    direction_nom = serializers.CharField(source='direction.nom', read_only=True)
    direction_numero = serializers.CharField(source='direction.numero', read_only=True)
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)
    service_numero = serializers.CharField(source='service.numero', read_only=True)
    division_nom = serializers.CharField(source='division.nom', read_only=True)
    division_numero = serializers.CharField(source='division.numero', read_only=True)
    
    # ✅ CHAMPS D'ÉCRITURE POUR LES RELATIONS ORGANISATIONNELLES
    structure_id = serializers.PrimaryKeyRelatedField(
        source='structure',
        queryset=Structure.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    direction_id = serializers.PrimaryKeyRelatedField(
        source='direction',
        queryset=Direction.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    service_id = serializers.PrimaryKeyRelatedField(
        source='service',
        queryset=Service.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    division_id = serializers.PrimaryKeyRelatedField(
        source='division',
        queryset=Division.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # ✅ RELATIONS AVEC LA STRUCTURE HIÉRARCHIQUE DES OBJECTIFS
    objectif_general_id = serializers.PrimaryKeyRelatedField(
        source='objectif_general',
        queryset=ObjectifGeneral.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    objectif_specifique_id = serializers.PrimaryKeyRelatedField(
        source='objectif_specifique',
        queryset=ObjectifSpecifique.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    resultat_attendu_id = serializers.PrimaryKeyRelatedField(
        source='resultat_attendu',
        queryset=ResultatAttendu.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # ✅ INFORMATIONS DES OBJECTIFS EN LECTURE SEULE
    objectif_general_titre = serializers.CharField(source='objectif_general.titre', read_only=True)
    objectif_specifique_titre = serializers.CharField(source='objectif_specifique.titre', read_only=True)
    resultat_attendu_description = serializers.CharField(source='resultat_attendu.description', read_only=True)
    
    # ✅ INFORMATIONS PCOP EN LECTURE SEULE
    pcop_code = serializers.CharField(source='pcop.code', read_only=True)
    pcop_libelle = serializers.CharField(source='pcop.libelle', read_only=True)
    
    class Meta: 
        model = Activite 
        fields = [ 
            'id', 
            # ✅ STRUCTURE HIÉRARCHIQUE DES OBJECTIFS
            'objectif_general', 'objectif_general_id', 'objectif_general_titre',
            'objectif_specifique', 'objectif_specifique_id', 'objectif_specifique_titre',
            'resultat_attendu', 'resultat_attendu_id', 'resultat_attendu_description',
            
            # ✅ STRUCTURE ORGANISATIONNELLE
            'structure', 'structure_id', 'structure_nom', 'structure_numero',
            'direction', 'direction_id', 'direction_nom', 'direction_numero',
            'service', 'service_id', 'service_nom', 'service_numero',  
            'division', 'division_id', 'division_nom', 'division_numero',
            
            # CHAMPS ACTIVITÉ
            'activite',
            'sous_activite', 
            'produits', 
            'cibles', 
            'sources_financement', 
            'pcop', 
            'pcop_code', 'pcop_libelle',
            'cout_unitaire', 
            'quantite', 
            'montant', 
            'observation', 
            'etat'
        ]
        
class SuiviSerializer(serializers.ModelSerializer): 
    activite_nom = serializers.CharField(source='activite.activite', read_only=True)
    activite_objectif = serializers.CharField(source='activite.objectif_general.titre', read_only=True)
    
    class Meta: 
        model = Suivi 
        fields = [
            'id',
            'activite',
            'activite_nom',  
            'activite_objectif', 
            'date_suivi',
            'observation',
            'avancement'
        ]