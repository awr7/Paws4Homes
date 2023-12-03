from django.contrib import admin
from .models import UserProfile
from .models import DogListing
from .models import AdoptionApplication
from django.utils.html import format_html

class DogListingAdmin(admin.ModelAdmin):
    list_display = ('name', 'breed', 'age', 'get_image_previews')

    def get_image_previews(self, obj):
        images = obj.images
        if images:
            
            images_html = ''.join([format_html('<img src="{}" width="100" height="auto" style="margin-right: 10px;" />', img) for img in images])
            return format_html(images_html)
        return "No Images"

    get_image_previews.short_description = 'Images'

admin.site.register(DogListing, DogListingAdmin)
admin.site.register(UserProfile)
admin.site.register(AdoptionApplication)