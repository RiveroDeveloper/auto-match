from django.urls import path, include
from rest_framework import routers
from . import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignupView, ExchangeRateViewSet

router = routers.DefaultRouter()
router.register(r'makes', views.MakeViewSet, basename='makes')
router.register(r'categories', views.CategoryViewSet, basename='categories')
router.register(r'vehicles', views.VehicleViewSet, basename='vehicles')
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'roles', views.RoleViewSet, basename='roles')
router.register(r'buyers', views.BuyerViewSet, basename='buyers')
router.register(r'experts', views.ExpertViewSet, basename='experts')
router.register(r'reviews', views.ReviewViewSet, basename='reviews')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'language', views.LanguageViewSet, basename='language')
router.register(r'exchange-rates', ExchangeRateViewSet, basename='exchange-rates')

urlpatterns = [
    # API versioning
    path('api/v1/', include(router.urls)),
    # JWT authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Signup endpoint
    path('api/signup/', SignupView.as_view(), name='signup'),
    # API documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]