import json
import logging
import re
from typing import Optional
from sqlalchemy.orm import Session
from json_repair import repair_json

from ..config import get_settings
from ..models.lesson import Lesson, LessonContent
from ..schemas.lesson import GeneratedContentSchema, FlashcardSchema, QuizQuestionSchema

settings = get_settings()
logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are an experienced financial literacy expert creating educational content for an online course.

## LESSON INFORMATION
- **Topic:** {title}
- **Difficulty Level:** {level} out of 5 (1=Beginner, 5=Master)  
- **Module:** {module}

## YOUR TASK
Create DETAILED educational content in English. The content must be GENUINELY useful and inspiring.

## CRITICAL
The response MUST be ONLY valid JSON without any additional text or markdown code blocks around it.

## LESSON TEXT REQUIREMENTS (lesson_text)
The text should be **1500-2500 words** and include:

1. **Introduction (200-300 words)**
   - Why this topic matters for life
   - What problem this knowledge solves
   - What the user will learn and be able to do after the lesson

2. **Core Theory (400-600 words)**
   - Key definitions and concepts
   - Detailed explanations with examples
   - Statistics and facts (use real data)

3. **Practical Examples (400-500 words)**
   - 2-3 specific life scenarios
   - Success or failure stories (realistic cases)
   - Calculations and numbers (if applicable)

4. **Step-by-Step Guide (300-400 words)**
   - Clear "what to do right now" instructions
   - Specific actions with a checklist

5. **Common Mistakes (200-300 words)**
   - 3-5 common errors
   - How to avoid them

6. **Conclusion and Motivation (200-300 words)**
   - Brief summary of main ideas
   - Inspiring conclusion

## TEXT FORMATTING
Use Markdown:
- `## Section Header`
- `### Subheader`
- `**bold text**` for key terms
- Bullet lists `-` 
- Numbered lists `1. 2. 3.`
- `> Quote` for important takeaways

## FLASHCARD REQUIREMENTS (10 cards)
- Questions must test UNDERSTANDING, not just memory
- Answers must be informative (1-2 sentences)
- Cover ALL key concepts of the lesson

## QUIZ REQUIREMENTS (10 questions)
- Answer options must be plausible
- Explanations must educate, not just confirm the answer
- Questions on understanding and applying knowledge

## LEVEL ADAPTATION
- **Level 1-2:** Simple language, basic concepts, many daily life examples
- **Level 3:** Medium complexity, more details, mentioning tools and methods
- **Level 4-5:** Advanced concepts, strategies, analytics, professional terms

## JSON RESPONSE FORMAT
{{
  "lesson_text": "Full lesson text in Markdown (1500-2500 words)...",
  "flashcards": [
    {{"question": "Question 1?", "answer": "Detailed answer."}},
    {{"question": "Question 2?", "answer": "Detailed answer."}},
    {{"question": "Question 3?", "answer": "Detailed answer."}},
    {{"question": "Question 4?", "answer": "Detailed answer."}},
    {{"question": "Question 5?", "answer": "Detailed answer."}},
    {{"question": "Question 6?", "answer": "Detailed answer."}},
    {{"question": "Question 7?", "answer": "Detailed answer."}},
    {{"question": "Question 8?", "answer": "Detailed answer."}},
    {{"question": "Question 9?", "answer": "Detailed answer."}},
    {{"question": "Question 10?", "answer": "Detailed answer."}}
  ],
  "quiz": [
    {{"question": "Question 1?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation..."}},
    {{"question": "Question 2?", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation..."}},
    {{"question": "Question 3?", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation..."}},
    {{"question": "Question 4?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation..."}},
    {{"question": "Question 5?", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation..."}},
    {{"question": "Question 6?", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation..."}},
    {{"question": "Question 7?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation..."}},
    {{"question": "Question 8?", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation..."}},
    {{"question": "Question 9?", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation..."}},
    {{"question": "Question 10?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation..."}}
  ]
}}
"""


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("Gemini API initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini API: {e}")
                self.model = None
    
    def generate_content(self, lesson: Lesson) -> GeneratedContentSchema:
        if self.model:
            try:
                return self._generate_with_gemini(lesson)
            except Exception as e:
                logger.error(f"Gemini generation failed: {e}")
                return self._generate_mock_content(lesson)
        else:
            logger.info("Using mock content (no Gemini API key)")
            return self._generate_mock_content(lesson)
    
    def _clean_json_response(self, response_text: str) -> str:
        text = response_text.strip()
        
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[-1].strip() == "```":
                lines = lines[1:-1]
            else:
                lines = lines[1:]
            text = "\n".join(lines)
        
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            text = text[start_idx:end_idx + 1]
        
        text = self._repair_json(text)
        
        return text
    
    def _repair_json(self, text: str) -> str:
        import re
        
        text = re.sub(r',(\s*[}\]])', r'\1', text)
        
        text = re.sub(r'(["\d\]}\w])\s*\n\s*(")', r'\1,\n\2', text)
        
        text = re.sub(r'"\s*\n\s*{', '", {', text)
        text = re.sub(r'}\s*\n\s*{', '}, {', text)
        text = re.sub(r']\s*\n\s*"', '], "', text)
        
        return text
    
    def _generate_with_gemini(self, lesson: Lesson) -> GeneratedContentSchema:
        prompt = PROMPT_TEMPLATE.format(
            title=lesson.title,
            level=lesson.level,
            module=lesson.module
        )
        
        response = self.model.generate_content(prompt)
        response_text = response.text.strip()
        
        logger.debug(f"Gemini response length: {len(response_text)} chars")
        
        cleaned_text = self._clean_json_response(response_text)
        
        try:
            data = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            logger.warning(f"Standard JSON parse failed, attempting repair: {e.msg}")
            try:
                repaired_text = repair_json(cleaned_text)
                data = json.loads(repaired_text)
                logger.info("JSON repair successful")
            except Exception as repair_error:
                logger.error(f"JSON repair also failed: {repair_error}")
                raise
        
        return GeneratedContentSchema(**data)
    
    def _generate_mock_content(self, lesson: Lesson) -> GeneratedContentSchema:
        lesson_text = f"""## {lesson.title}

Welcome to the lesson **{lesson.title}**! This lesson belongs to Level {lesson.level} and will help you understand important aspects of financial literacy.

### Introduction

Financial literacy is a skill that helps you make informed decisions about money. In this lesson, we will cover key concepts related to "{lesson.title}".

### Core Concepts

1. **First Key Point**: Understanding basic principles will help you better manage your finances.
2. **Second Key Point**: Applying knowledge in practice is more important than theory.
3. **Third Key Point**: Consistency and discipline are keys to success.

### Practical Tips

- Start small and gradually increase complexity
- Track your finances
- Don't be afraid of mistakes — they are part of learning
- Apply knowledge in real life

### Conclusion

Remember: financial literacy is a skill that develops over time. Keep learning and applying your knowledge!
"""

        flashcards = [
            FlashcardSchema(question=f"What is {lesson.title.lower().split()[0]}?", answer="It is a key element of financial literacy."),
            FlashcardSchema(question="Why is financial literacy important?", answer="It helps make informed money decisions."),
            FlashcardSchema(question="Where start learning finance?", answer="From basic concepts: income, expenses, budget."),
            FlashcardSchema(question="What is a budget?", answer="A plan for allocating income and expenses."),
            FlashcardSchema(question="Why track expenses?", answer="To understand where money goes."),
            FlashcardSchema(question="What is an emergency fund?", answer="A cash reserve for unexpected expenses."),
            FlashcardSchema(question="What is the recommended size of an emergency fund?", answer="3-6 months of expenses."),
            FlashcardSchema(question="Difference between assets and liabilities?", answer="Assets bring income, liabilities bring expenses."),
            FlashcardSchema(question="What is compound interest?", answer="Interest calculated on the initial principal and accumulated interest."),
            FlashcardSchema(question="Why start investing early?", answer="More time for compound interest to work."),
        ]

        quiz = [
            QuizQuestionSchema(
                question=f"What is the main principle of the lesson '{lesson.title}'?",
                options=["Spend more", "Plan finances", "Take loans", "Ignore budget"],
                correct_index=1,
                explanation="Planning is the foundation of financial literacy."
            ),
            QuizQuestionSchema(
                question="What is the 50/30/20 rule?",
                options=["Budget allocation", "Investment strategy", "Credit score", "Fund size"],
                correct_index=0,
                explanation="50% needs, 30% wants, 20% savings."
            ),
            QuizQuestionSchema(
                question="What is the recommended emergency fund size?",
                options=["1 month", "3-6 months", "1 year", "Not needed"],
                correct_index=1,
                explanation="3-6 months of expenses is the optimal reserve."
            ),
            QuizQuestionSchema(
                question="What to do first after receiving a salary?",
                options=["Spend on wants", "Save a portion", "Take a loan", "Buy stocks"],
                correct_index=1,
                explanation="The 'pay yourself first' principle."
            ),
            QuizQuestionSchema(
                question="How to deal with impulse buying?",
                options=["24-hour rule", "More loans", "Ignore", "No budgeting"],
                correct_index=0,
                explanation="Wait 24 hours before a major purchase."
            ),
            QuizQuestionSchema(
                question="What is diversification?",
                options=["One asset", "Risk distribution", "Only deposits", "Loans"],
                correct_index=1,
                explanation="Don't put all eggs in one basket."
            ),
            QuizQuestionSchema(
                question="What is the first step to investing?",
                options=["Take a credit", "Create a safety fund", "Buy crypto", "Ignore risks"],
                correct_index=1,
                explanation="Safety first, then investments."
            ),
            QuizQuestionSchema(
                question="What is passive income?",
                options=["Salary", "Income without active labor", "Loan", "Expense"],
                correct_index=1,
                explanation="Income from investments, rent, etc."
            ),
            QuizQuestionSchema(
                question="Why is credit history important?",
                options=["For shopping", "Assessing reliability", "Not needed", "For work"],
                correct_index=1,
                explanation="Banks assess your reliability based on history."
            ),
            QuizQuestionSchema(
                question="What is more important: income or expenses?",
                options=["Only income", "Only expenses", "Balance of both", "Nothing"],
                correct_index=2,
                explanation="It's important to manage both."
            ),
        ]

        return GeneratedContentSchema(
            lesson_text=lesson_text,
            flashcards=flashcards,
            quiz=quiz
        )
    
    def save_content(self, db: Session, lesson: Lesson, content: GeneratedContentSchema) -> LessonContent:
        lesson_content = LessonContent(
            lesson_id=lesson.id,
            lesson_text=content.lesson_text,
            flashcards_json=json.dumps([fc.model_dump() for fc in content.flashcards], ensure_ascii=False),
            quiz_json=json.dumps([q.model_dump() for q in content.quiz], ensure_ascii=False)
        )
        db.add(lesson_content)
        db.commit()
        db.refresh(lesson_content)
        return lesson_content
    
    def get_content(self, db: Session, lesson_id: int) -> Optional[LessonContent]:
        return db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first()
