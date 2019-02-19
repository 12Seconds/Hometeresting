from django import forms

from .models import UserImage

class UserImageForm(forms.ModelForm):
	class Meta:
		model = UserImage
		fields =('imageData',)

	def __init__(self, *args, **kwargs):
		super(PostForm, self).__init__(*args,**kargs)
		self.fields['file'].required = False