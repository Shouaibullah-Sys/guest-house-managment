"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { Question } from "@/types/types";
import {
  approveQuestion,
  deleteQuestion,
  getAllQuestionsWithAnswers,
  approveAnswer,
  deleteAnswer,
  submitAnswer,
} from "./actions";

export default function AdminConversationPage() {
  const { user, isLoaded } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newAnswers, setNewAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const userRole = user?.publicMetadata?.role as string;
  const isAdminOrLab = userRole === "admin" || userRole === "laboratory";

  useEffect(() => {
    if (isLoaded) {
      fetchQuestions();
    }
  }, [isLoaded]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getAllQuestionsWithAnswers();
      setQuestions(questionsData);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (questionId: number) => {
    const answer = newAnswers[questionId];
    if (!answer?.trim() || !user) return;

    setSubmitting((prev) => ({ ...prev, [`answer-${questionId}`]: true }));
    try {
      await submitAnswer({
        ans: answer,
        questionId,
        contributor: `${user.firstName} ${user.lastName}`,
        contributorId: user.id,
      });
      setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setSubmitting((prev) => ({ ...prev, [`answer-${questionId}`]: false }));
    }
  };

  const handleApproveQuestion = async (id: number) => {
    await approveQuestion(id);
    await fetchQuestions();
  };

  const handleDeleteQuestion = async (id: number) => {
    setDeleting((prev) => ({ ...prev, [`question-${id}`]: true }));
    try {
      await deleteQuestion(id);
      // Remove the question from local state immediately for better UX
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Failed to delete question:", error);
      // If there's an error, refetch to ensure consistency
      await fetchQuestions();
    } finally {
      setDeleting((prev) => ({ ...prev, [`question-${id}`]: false }));
    }
  };

  const handleApproveAnswer = async (answerId: number) => {
    await approveAnswer(answerId);
    await fetchQuestions();
  };

  const handleDeleteAnswer = async (answerId: number) => {
    setDeleting((prev) => ({ ...prev, [`answer-${answerId}`]: true }));
    try {
      await deleteAnswer(answerId);
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to delete answer:", error);
    } finally {
      setDeleting((prev) => ({ ...prev, [`answer-${answerId}`]: false }));
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdminOrLab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              This page is for clinic administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separate questions into categories
  const pendingQuestions = questions.filter((q) => !q.approved);
  const approvedQuestions = questions.filter((q) => q.approved);
  const unansweredQuestions = approvedQuestions.filter(
    (q) => !q.answers.some((a) => a.approved)
  );
  const answeredQuestions = approvedQuestions.filter((q) =>
    q.answers.some((a) => a.approved)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Admin Conversation
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer patient questions and moderate the Q&A content
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {questions.length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingQuestions.length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Unanswered
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {unansweredQuestions.length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Answered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {answeredQuestions.length}
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Questions Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              Pending Approval
              <Badge variant="secondary" className="ml-2">
                {pendingQuestions.length}
              </Badge>
            </h2>

            {pendingQuestions.length === 0 ? (
              <Card className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">
                  All caught up!
                </h3>
                <p className="text-gray-400">No questions pending approval.</p>
              </Card>
            ) : (
              pendingQuestions.map((question) => (
                <AdminQuestionCard
                  key={question.id}
                  question={question}
                  onQuestionApproved={handleApproveQuestion}
                  onQuestionDeleted={handleDeleteQuestion}
                  deleting={deleting[`question-${question.id}`]}
                />
              ))
            )}
          </div>

          {/* Unanswered Questions Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Need Answers
              <Badge variant="secondary" className="ml-2">
                {unansweredQuestions.length}
              </Badge>
            </h2>

            {unansweredQuestions.length === 0 ? (
              <Card className="text-center py-8">
                <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">
                  All questions answered!
                </h3>
                <p className="text-gray-400">No unanswered questions.</p>
              </Card>
            ) : (
              unansweredQuestions.map((question) => (
                <AdminQuestionCard
                  key={question.id}
                  question={question}
                  newAnswer={newAnswers[question.id!] || ""}
                  onNewAnswerChange={(value: string) =>
                    setNewAnswers((prev) => ({
                      ...prev,
                      [question.id!]: value,
                    }))
                  }
                  onAnswerSubmit={() => handleSubmitAnswer(question.id!)}
                  onAnswerApproved={handleApproveAnswer}
                  onAnswerDeleted={handleDeleteAnswer}
                  onQuestionDeleted={handleDeleteQuestion}
                  submitting={submitting[`answer-${question.id}`]}
                  deleting={deleting[`question-${question.id}`]}
                />
              ))
            )}
          </div>
        </div>

        {/* Answered Questions Section */}
        {answeredQuestions.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Answered Questions
              <Badge variant="secondary" className="ml-2">
                {answeredQuestions.length}
              </Badge>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {answeredQuestions.map((question) => (
                <AdminQuestionCard
                  key={question.id}
                  question={question}
                  onAnswerApproved={handleApproveAnswer}
                  onAnswerDeleted={handleDeleteAnswer}
                  onQuestionDeleted={handleDeleteQuestion}
                  showAllAnswers
                  deleting={deleting[`question-${question.id}`]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Question Card Component
function AdminQuestionCard({
  question,
  newAnswer,
  onNewAnswerChange,
  onAnswerSubmit,
  onQuestionApproved,
  onQuestionDeleted,
  onAnswerApproved,
  onAnswerDeleted,
  submitting,
  deleting,
  showAllAnswers = false,
}: any) {
  const approvedAnswers = question.answers.filter((a: any) => a.approved);
  const pendingAnswers = question.answers.filter((a: any) => !a.approved);

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm relative">
      {/* Close/Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onQuestionDeleted(question.id)}
        disabled={deleting}
        className="absolute top-3 right-3 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
        title="Delete question"
      >
        {deleting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>

      <CardContent className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4 pr-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {question.quiz}
              </h3>
              {!question.approved ? (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending Approval
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {question.contributor}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(question.timestamp!).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Question Moderation Actions for Pending Questions */}
        {!question.approved && onQuestionApproved && onQuestionDeleted && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              onClick={() => onQuestionApproved(question.id)}
              className="bg-green-600 hover:bg-green-700 h-8 px-3"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuestionDeleted(question.id)}
              disabled={deleting}
              className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Reject & Delete
                </>
              )}
            </Button>
          </div>
        )}

        {/* Answers Section */}
        <div className="space-y-4">
          {/* Approved Answers */}
          {(showAllAnswers || approvedAnswers.length > 0) && (
            <>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approved Answers ({approvedAnswers.length})
              </h4>
              {approvedAnswers.map((answer: any) => (
                <AnswerItem
                  key={answer.id}
                  answer={answer}
                  onApprove={onAnswerApproved}
                  onDelete={onAnswerDeleted}
                  isApproved={true}
                  deleting={deleting}
                />
              ))}
            </>
          )}

          {/* Pending Answers */}
          {pendingAnswers.length > 0 && (
            <>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Pending Answers ({pendingAnswers.length})
              </h4>
              {pendingAnswers.map((answer: any) => (
                <AnswerItem
                  key={answer.id}
                  answer={answer}
                  onApprove={onAnswerApproved}
                  onDelete={onAnswerDeleted}
                  isApproved={false}
                  deleting={deleting}
                />
              ))}
            </>
          )}

          {/* Answer Input */}
          {question.approved && onAnswerSubmit && (
            <div className="border-t pt-4">
              <Label
                htmlFor={`answer-${question.id}`}
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Your Answer
              </Label>
              <div className="space-y-3">
                <Textarea
                  id={`answer-${question.id}`}
                  placeholder="Type your professional answer here..."
                  value={newAnswer}
                  onChange={(e) => onNewAnswerChange(e.target.value)}
                  rows={3}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={onAnswerSubmit}
                    disabled={!newAnswer.trim() || submitting}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Answer Item Component
function AnswerItem({
  answer,
  onApprove,
  onDelete,
  isApproved,
  deleting,
}: any) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        isApproved
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-800">{answer.ans}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {answer.contributor}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(answer.timestamp!).toLocaleDateString()}
            </div>
            {isApproved && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs"
              >
                Approved
              </Badge>
            )}
            {!isApproved && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
              >
                Pending Review
              </Badge>
            )}
          </div>
        </div>

        {/* Answer Moderation Actions */}
        {onApprove && onDelete && (
          <div className="flex gap-2 ml-4">
            {!isApproved && (
              <Button
                size="sm"
                onClick={() => onApprove(answer.id)}
                className="bg-green-600 hover:bg-green-700 h-7 px-2"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(answer.id)}
              disabled={deleting}
              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
