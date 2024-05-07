import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createTask,
  deleteTask,
  updateTask,
} from "@/lib/api/tasks/mutations";
import { 
  taskIdSchema,
  insertTaskParams,
  updateTaskParams 
} from "@/lib/db/schema/tasks";

export async function POST(req: Request) {
  try {
    const validatedData = insertTaskParams.parse(await req.json());
    const { task } = await createTask(validatedData);

    revalidatePath("/tasks"); // optional - assumes you will have named route same as entity

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateTaskParams.parse(await req.json());
    const validatedParams = taskIdSchema.parse({ id });

    const { task } = await updateTask(validatedParams.id, validatedData);

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = taskIdSchema.parse({ id });
    const { task } = await deleteTask(validatedParams.id);

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}
