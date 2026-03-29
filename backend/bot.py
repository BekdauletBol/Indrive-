"""
inVision U Telegram Bot — candidate intake
Collects: name, age, motivation, essay, activities
Then sends to the scoring API and returns result to candidate.

Run:
    pip install python-telegram-bot httpx
    BOT_TOKEN=<token> API_URL=http://localhost:8000 python bot.py
"""

import os, asyncio, httpx
from telegram import Update
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler,
    ConversationHandler, filters, ContextTypes,
)

API_URL = os.getenv("API_URL", "http://localhost:8000")
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_TOKEN_HERE")

NAME, AGE, MOTIVATION, ESSAY, ACTIVITIES, FIRST_GEN = range(6)


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Welcome to the inVision U application assistant!\n\n"
        "I'll ask you a few questions to help assess your application. "
        "Your answers go directly to our admissions team — no decision is made automatically.\n\n"
        "Let's begin. What is your full name?"
    )
    return NAME


async def get_name(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["name"] = update.message.text.strip()
    await update.message.reply_text("How old are you?")
    return AGE


async def get_age(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    try:
        age = int(update.message.text.strip())
        if not (14 <= age <= 30):
            await update.message.reply_text("Please enter an age between 14 and 30.")
            return AGE
        ctx.user_data["age"] = age
    except ValueError:
        await update.message.reply_text("Please enter a number.")
        return AGE
    await update.message.reply_text(
        "In 2–3 sentences, why do you want to study at inVision U? "
        "What problem do you want to solve?"
    )
    return MOTIVATION


async def get_motivation(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["motivation"] = update.message.text.strip()
    await update.message.reply_text(
        "Now write a short personal essay (at least 3–4 sentences):\n\n"
        "Tell us about a challenge you overcame, a project you led, "
        "or a moment that changed how you think."
    )
    return ESSAY


async def get_essay(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["essay"] = update.message.text.strip()
    await update.message.reply_text(
        "List any clubs, projects, or volunteering you've done "
        "(comma-separated, or type 'none'):"
    )
    return ACTIVITIES


async def get_activities(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    raw = update.message.text.strip()
    ctx.user_data["activities"] = (
        [] if raw.lower() == "none"
        else [a.strip() for a in raw.split(",") if a.strip()]
    )
    await update.message.reply_text(
        "Are you the first person in your family to attend university? (yes / no)"
    )
    return FIRST_GEN


async def get_first_gen(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["first_gen"] = update.message.text.strip().lower() in ("yes", "да", "иа")
    await update.message.reply_text("⏳ Analysing your application…")

    payload = {
        "name":       ctx.user_data["name"],
        "age":        ctx.user_data["age"],
        "essay":      ctx.user_data["essay"],
        "motivation": ctx.user_data["motivation"],
        "activities": ctx.user_data["activities"],
        "first_gen":  ctx.user_data["first_gen"],
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{API_URL}/score", json=payload)
            result = r.json()

        score = result["total_score"]
        shortlist = result["shortlist"]
        breakdown = result["breakdown"]

        lines = [
            f"✅ Application received, {ctx.user_data['name']}!\n",
            f"Your preliminary score: *{score}/100*",
            f"Status: {'🟢 Promising — the committee will review your file' if shortlist else '🟡 Under consideration — keep developing your story'}",
            "",
            "Score breakdown:",
            f"  Leadership:    {round(breakdown['leadership_potential']*100)}%",
            f"  Motivation:    {round(breakdown['motivation_clarity']*100)}%",
            f"  Growth:        {round(breakdown['growth_trajectory']*100)}%",
            f"  Communication: {round(breakdown['communication']*100)}%",
            f"  Authenticity:  {round(breakdown['ai_authenticity']*100)}%",
            "",
            "📋 This is an AI-assisted preliminary assessment only. "
            "Final decisions are made by the admissions committee.",
        ]
        await update.message.reply_text("\n".join(lines), parse_mode="Markdown")

    except Exception as e:
        await update.message.reply_text(
            "Something went wrong submitting your application. "
            "Please contact us directly at admissions@invisionu.edu.kz"
        )

    return ConversationHandler.END


async def cancel(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Application cancelled. Type /start to begin again.")
    return ConversationHandler.END


def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    conv = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            NAME:       [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            AGE:        [MessageHandler(filters.TEXT & ~filters.COMMAND, get_age)],
            MOTIVATION: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_motivation)],
            ESSAY:      [MessageHandler(filters.TEXT & ~filters.COMMAND, get_essay)],
            ACTIVITIES: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_activities)],
            FIRST_GEN:  [MessageHandler(filters.TEXT & ~filters.COMMAND, get_first_gen)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(conv)
    print("Bot running…")
    app.run_polling()


if __name__ == "__main__":
    main()
