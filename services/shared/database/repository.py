"""
repository.py — Generic async CRUD repository.
Each service extends this with domain-specific query methods.

Example:
    class WorkerRepository(BaseRepository[Worker]):
        async def get_by_phone(self, phone: str) -> Worker | None:
            result = await self.db.execute(select(Worker).where(Worker.phone == phone))
            return result.scalar_one_or_none()
"""
from typing import Generic, TypeVar, Type, Sequence
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .base_model import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model     # the SQLAlchemy model class
        self.db    = db        # the async session injected per request

    async def get(self, id: UUID) -> ModelType | None:
        """Fetch a single record by primary key. Returns None if not found."""
        return await self.db.get(self.model, id)

    async def list(self, limit: int = 20, offset: int = 0) -> Sequence[ModelType]:
        """Paginated list of all records for a model."""
        result = await self.db.execute(select(self.model).limit(limit).offset(offset))
        return result.scalars().all()

    async def create(self, obj: ModelType) -> ModelType:
        """Persist a new record and return it with generated id + timestamps."""
        self.db.add(obj)
        await self.db.flush()   # flush to get DB-assigned values (id, timestamps)
        return obj

    async def delete(self, id: UUID) -> bool:
        """Delete by id. Returns True if a row was removed."""
        obj = await self.get(id)
        if obj:
            await self.db.delete(obj)
            return True
        return False
