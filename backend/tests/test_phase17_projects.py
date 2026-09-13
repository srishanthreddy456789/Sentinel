import asyncio
import sys
from pathlib import Path
import pytest
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinel.database.database import AsyncSessionLocal, engine, Base
from sentinel.database.models import Developer, Project, ProjectChat, ProjectMessage


@pytest.mark.asyncio
async def test_projects_and_linked_chats():
    print("\nTesting Phase 17 Projects and Linked Multi-Chat Workspace Engine...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Create or fetch developer
        res_dev = await session.execute(select(Developer))
        dev = res_dev.scalars().first()
        if not dev:
            dev = Developer(email="project_test@sentinel.ai", password_hash="hashed_pw")
            session.add(dev)
            await session.commit()
            await session.refresh(dev)

        # 2. Create a new Project workspace
        project = Project(
            developer_id=dev.id,
            name="E-Commerce Customer Care Project",
            description="ChatGPT-style project workspace for e-commerce AI assistant",
            system_instructions="You are a helpful e-commerce support AI. Always reference order policies.",
            context_docs="Return Policy: 30 days money-back guarantee. Shipping: Free on orders over $50.",
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)

        print(f"  [OK] Project Created: ID={project.id}, Name='{project.name}'")
        assert project.id is not None
        assert project.name == "E-Commerce Customer Care Project"

        # 3. Create Linked Chats under Project
        chat1 = ProjectChat(project_id=project.id, title="Returns & Refunds Session")
        chat2 = ProjectChat(project_id=project.id, title="Shipping Status Session")
        session.add_all([chat1, chat2])
        await session.commit()
        await session.refresh(chat1)
        await session.refresh(chat2)

        print(f"  [OK] Linked Chats Created: Chat1 ID={chat1.id}, Chat2 ID={chat2.id}")
        assert chat1.project_id == project.id
        assert chat2.project_id == project.id

        # 4. Add User and Assistant Messages inside Linked Chat 1
        msg1 = ProjectMessage(
            chat_id=chat1.id,
            role="user",
            content="What is your return policy?",
        )
        msg2 = ProjectMessage(
            chat_id=chat1.id,
            role="assistant",
            content="Based on project knowledge: Return Policy is 30 days money-back guarantee.",
            correctness=0.95,
            faithfulness=0.98,
            latency_ms=210.5,
        )
        session.add_all([msg1, msg2])
        await session.commit()

        # 5. Verify Parent Project Relationship and Multi-Chat Retrieval
        res_proj_chats = await session.execute(
            select(Project)
            .options(selectinload(Project.chats).selectinload(ProjectChat.messages))
            .where(Project.id == project.id)
        )
        fetched_proj = res_proj_chats.scalar_one()

        print(f"  [OK] Project Linked Chat Count: {len(fetched_proj.chats)}")
        assert len(fetched_proj.chats) == 2

        fetched_chat1 = next(c for c in fetched_proj.chats if c.id == chat1.id)
        assert len(fetched_chat1.messages) == 2
        assert fetched_chat1.messages[1].correctness == 0.95
        print(f"  [OK] Linked Messages in Chat 1: {len(fetched_chat1.messages)} messages, Correctness={fetched_chat1.messages[1].correctness}")

    print("Phase 17 Projects and Linked Multi-Chat Workspace Test PASSED!\n")


if __name__ == "__main__":
    asyncio.run(test_projects_and_linked_chats())
