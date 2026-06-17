from fastapi import APIRouter

from app.api.v1.auth.routes import router as auth_router
from app.api.v1.products.routes import router as products_router
from app.api.v1.customers.routes import router as customers_router
from app.api.v1.orders.routes import router as orders_router
from app.api.v1.dashboard.routes import router as dashboard_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(customers_router)
api_router.include_router(orders_router)
api_router.include_router(dashboard_router)

assessment_router = APIRouter()
assessment_router.include_router(auth_router)
assessment_router.include_router(products_router)
assessment_router.include_router(customers_router)
assessment_router.include_router(orders_router)
assessment_router.include_router(dashboard_router)
