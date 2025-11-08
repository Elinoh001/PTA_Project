from django.db import models
from django.utils import timezone
from django.db.models.signals import pre_save
from django.dispatch import receiver

ROLE_CHOICES = ( 
    ('admin','Admin'), 
    ('user','User'), 
    ('superviseur','Superviseur'), 
) 

class UserProfile(models.Model): 
    nom = models.CharField(max_length=150) 
    email = models.EmailField(unique=True) 
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user') 
    auth_user = models.OneToOneField('auth.User', null=True, blank=True, on_delete=models.SET_NULL) 
    
    def __str__(self):
        return self.nom 

# ✅ NOUVELLE STRUCTURE HIÉRARCHIQUE ORGANISATIONNELLE
class Structure(models.Model):
    numero = models.CharField(max_length=10, unique=True)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Structure"
        verbose_name_plural = "Structures"

    def __str__(self):
        return f"{self.numero} - {self.nom}"
    
class Direction(models.Model):
    structure = models.ForeignKey(Structure, on_delete=models.CASCADE, related_name='directions', null=True, blank=True)
    numero = models.CharField(max_length=10, default="D1")  # ✅ Ajout d'une valeur par défaut
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Direction"
        verbose_name_plural = "Directions"
        unique_together = ['structure', 'numero']
    
    def __str__(self):
        return f"{self.numero} - {self.nom}"

class Service(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='services', null=True, blank=True)
    numero = models.CharField(max_length=10, default="S1")  # ✅ Ajout d'une valeur par défaut
    nom_service = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    
    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        unique_together = ['direction', 'numero']
    
    def __str__(self):
        return f"{self.numero} - {self.nom_service}"

class Division(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='divisions', null=True, blank=True)
    numero = models.CharField(max_length=10, default="DV1")  # ✅ Ajout d'une valeur par défaut
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Division"
        verbose_name_plural = "Divisions"
        unique_together = ['service', 'numero']
    
    def __str__(self):
        return f"{self.numero} - {self.nom}"
    
class PCOPEntry(models.Model): 
    code = models.CharField(max_length=50, blank=True) 
    libelle = models.CharField(max_length=255, blank=True) 
    cout_unitaire = models.DecimalField(max_digits=14, decimal_places=2, default=0) 
     
    def __str__(self): 
        return f"{self.code} - {self.libelle}"

# STRUCTURE HIÉRARCHIQUE DES OBJECTIFS
class ObjectifGeneral(models.Model):
    numero = models.CharField(max_length=10, unique=True)
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Objectif Général"
        verbose_name_plural = "Objectifs Généraux"
    
    def __str__(self):
        return f"{self.numero} - {self.titre}"

class ObjectifSpecifique(models.Model):
    objectif_general = models.ForeignKey(ObjectifGeneral, on_delete=models.CASCADE, related_name='objectifs_specifiques')
    numero = models.CharField(max_length=10)  # OS1.1, OS1.2, etc.
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Objectif Spécifique"
        verbose_name_plural = "Objectifs Spécifiques"
    
    def __str__(self):
        return f"{self.numero} - {self.titre}"

class ResultatAttendu(models.Model):
    objectif_specifique = models.ForeignKey(ObjectifSpecifique, on_delete=models.CASCADE, related_name='resultats_attendus')
    numero = models.CharField(max_length=10)  # RA1.1.1, RA1.1.2, etc.
    description = models.TextField()
    
    class Meta:
        verbose_name = "Résultat Attendu"
        verbose_name_plural = "Résultats Attendus"
    
    def __str__(self):
        return f"{self.numero} - {self.description[:50]}"
    
class Activite(models.Model): 
    # RELATIONS AVEC LA STRUCTURE HIÉRARCHIQUE DES OBJECTIFS
    objectif_general = models.ForeignKey(ObjectifGeneral, on_delete=models.SET_NULL, null=True, blank=True)
    objectif_specifique = models.ForeignKey(ObjectifSpecifique, on_delete=models.SET_NULL, null=True, blank=True)
    resultat_attendu = models.ForeignKey(ResultatAttendu, on_delete=models.SET_NULL, null=True, blank=True)

    # RELATIONS AVEC LA STRUCTURE HIÉRARCHIQUE ORGANISATIONNELLE
    structure = models.ForeignKey(Structure, on_delete=models.SET_NULL, null=True, blank=True, related_name='activites') 
    direction = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True, related_name='activites')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='activites') 
    division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True, blank=True, related_name='activites')
    
    # ✅ AJOUT DES DATES DE DÉBUT ET FIN
    date_debut = models.DateField(null=True, blank=True, verbose_name="Date de début")
    date_fin = models.DateField(null=True, blank=True, verbose_name="Date de fin prévue")
    
    activite = models.TextField(blank=True) 
    sous_activite = models.TextField(blank=True) 
    produits = models.TextField(blank=True) 
    cibles = models.CharField(max_length=255, blank=True) 
    sources_financement = models.CharField(max_length=255, blank=True) 
    
    # RELATION AVEC PCOP
    pcop = models.ForeignKey(PCOPEntry, on_delete=models.SET_NULL, null=True, blank=True, related_name='activites')
    
    cout_unitaire = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True) 
    quantite = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True) 
    montant = models.DecimalField(max_digits=16, decimal_places=2, null=True, blank=True) 
    observation = models.TextField(blank=True) 
    etat = models.CharField(max_length=50, default='En cours', blank=True) 
    
    def __str__(self): 
        return f"{self.activite[:60]}"
    
    # ✅ PROPRIÉTÉ POUR VÉRIFIER SI L'ACTIVITÉ EST EN RETARD
    @property
    def est_en_retard(self):
        if self.date_fin and timezone.now().date() > self.date_fin and self.etat != 'Terminé':
            return True
        return False
    
    # ✅ PROPRIÉTÉ POUR CALCULER LE JOURS RESTANTS
    @property
    def jours_restants(self):
        if self.date_fin:
            today = timezone.now().date()
            jours_restants = (self.date_fin - today).days
            return max(jours_restants, 0)  # Retourne 0 si la date est dépassée
        return None
    
    # PROPRIÉTÉS POUR ACCÉDER FACILEMENT AUX INFORMATIONS DES OBJECTIFS
    @property
    def objectif_general_titre(self):
        return self.objectif_general.titre if self.objectif_general else ""
    
    @property
    def objectif_specifique_titre(self):
        return self.objectif_specifique.titre if self.objectif_specifique else ""
    
    @property
    def structure_nom(self):
        return f"{self.structure.numero} - {self.structure.nom}" if self.structure else ""

    @property
    def resultat_attendu_description(self):
        return self.resultat_attendu.description if self.resultat_attendu else ""
    
    # PROPRIÉTÉS POUR ACCÉDER AUX INFORMATIONS ORGANISATIONNELLES
    @property
    def direction_nom(self):
        return f"{self.direction.numero} - {self.direction.nom}" if self.direction else ""
    
    @property
    def service_nom(self):
        return f"{self.service.numero} - {self.service.nom_service}" if self.service else ""
    
    @property
    def division_nom(self):
        return f"{self.division.numero} - {self.division.nom}" if self.division else ""
    
    # PROPRIÉTÉ POUR ACCÉDER AU CODE PCOP
    @property
    def pcop_code(self):
        return self.pcop.code if self.pcop else ""
    
    # PROPRIÉTÉ POUR ACCÉDER AU LIBELLÉ PCOP
    @property
    def pcop_libelle(self):
        return self.pcop.libelle if self.pcop else ""

class Suivi(models.Model): 
    activite = models.ForeignKey(Activite, on_delete=models.CASCADE, related_name='suivis') 
    date_suivi = models.DateField()
    observation = models.TextField(blank=True) 
    avancement = models.IntegerField(null=True, blank=True) 
    
    # ✅ AJOUT DU CHAMP DE NOTIFICATION
    notification_retard = models.BooleanField(default=False, verbose_name="Notification de retard")
    message_notification = models.TextField(blank=True, verbose_name="Message de notification")
    
    def __str__(self):
        return f"Suivi {self.activite} - {self.date_suivi}"
    
    # ✅ MÉTHODE POUR VÉRIFIER ET METTRE À JOUR LES NOTIFICATIONS
    def verifier_retard(self):
        if self.activite.est_en_retard and not self.notification_retard:
            self.notification_retard = True
            self.message_notification = f"ATTENTION : L'activité '{self.activite.activite[:50]}...' est en retard. Date de fin prévue : {self.activite.date_fin}"
            self.save()
    
    # ✅ SURCHARGE DE LA MÉTHODE SAVE POUR AUTOMATISER LES NOTIFICATIONS
    def save(self, *args, **kwargs):
        # Vérifier le retard avant la sauvegarde
        if self.activite and self.activite.date_fin:
            if timezone.now().date() > self.activite.date_fin and self.activite.etat != 'Terminé':
                self.notification_retard = True
                self.message_notification = f"ATTENTION : L'activité '{self.activite.activite[:50]}...' est en retard. Date de fin prévue : {self.activite.date_fin}"
        
        super().save(*args, **kwargs)

# ✅ SIGNAL POUR METTRE À JOUR AUTOMATIQUEMENT L'ÉTAT SI L'AVANCEMENT EST À 100%
@receiver(pre_save, sender=Suivi)
def mettre_a_jour_etat_activite(sender, instance, **kwargs):
    if instance.avancement == 100 and instance.activite.etat != 'Terminé':
        instance.activite.etat = 'Terminé'
        instance.activite.save()