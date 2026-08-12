"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { AssessmentQuestion } from "@/types"

interface MCQQuestionProps {
  question: AssessmentQuestion
  selectedAnswerIndex: number | undefined
  onSelectAnswer: (index: number) => void
}

export function MCQQuestion({
  question,
  selectedAnswerIndex,
  onSelectAnswer,
}: MCQQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </div>
          {(question.skillTag || question.difficulty) && (
            <div className="flex flex-wrap gap-2 justify-end">
              {question.skillTag && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  {question.skillTag}
                </span>
              )}
              {question.difficulty && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    question.difficulty === "easy"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : question.difficulty === "medium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  }`}
                >
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswerIndex?.toString() ?? ""}
          onValueChange={(value) => onSelectAnswer(parseInt(value))}
        >
          <div className="space-y-3">
            {(question.options ?? []).map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

interface FillBlankQuestionProps {
  question: AssessmentQuestion
  answer: string | undefined
  onAnswerChange: (text: string) => void
}

export function FillBlankQuestion({ question, answer, onAnswerChange }: FillBlankQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </div>
          {(question.skillTag || question.difficulty) && (
            <div className="flex flex-wrap gap-2 justify-end">
              {question.skillTag && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  {question.skillTag}
                </span>
              )}
              {question.difficulty && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    question.difficulty === "easy"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : question.difficulty === "medium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  }`}
                >
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
              💡 Fill in the Blank
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Complete the statement above by filling in the blank space.
            </p>
          </div>

          <div>
            <label htmlFor="fill-blank" className="text-sm font-medium block mb-2">
              Your Answer
            </label>
            <Textarea
              id="fill-blank"
              placeholder="Type the word or phrase that completes the statement..."
              value={answer ?? ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Be concise and accurate with your answer.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DescriptiveQuestionProps {
  question: AssessmentQuestion
  answer: string | undefined
  onAnswerChange: (text: string) => void
}

export function DescriptiveQuestion({
  question,
  answer,
  onAnswerChange,
}: DescriptiveQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </div>
          {(question.skillTag || question.difficulty) && (
            <div className="flex flex-wrap gap-2 justify-end">
              {question.skillTag && (
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                  {question.skillTag}
                </span>
              )}
              {question.difficulty && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    question.difficulty === "easy"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : question.difficulty === "medium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  }`}
                >
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-lg p-3">
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
              📝 Descriptive Answer Required
            </p>
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              Provide a detailed, well-thought-out response to the question above.
            </p>
          </div>

          <div>
            <label htmlFor="descriptive-answer" className="text-sm font-medium block mb-2">
              Your Answer
            </label>
            <Textarea
              id="descriptive-answer"
              placeholder="Provide a detailed explanation or answer here. Take your time to explain your thoughts clearly..."
              value={answer ?? ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="min-h-48 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This response will be reviewed by our assessment team. Be clear, concise, and thorough.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
