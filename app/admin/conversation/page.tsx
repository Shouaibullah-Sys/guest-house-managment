// app/conversation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Question } from "@/types/types";
import {
  approveQuestion,
  disapproveQuestion,
  getAllQuestionsWithAnswers,
  approveAnswer,
  disapproveAnswer,
  submitQuestion,
  submitAnswer,
} from "./actions";

export default function QAPage() {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  const userRole = user?.publicMetadata?.role as string;
  const isAdminOrLab = userRole === "admin" || userRole === "laboratory";

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const questions = await getAllQuestionsWithAnswers();
    // Convert Date objects to strings for timestamp compatibility
    const formattedQuestions = questions.map((question) => ({
      ...question,
      timestamp: question.timestamp?.toISOString(),
      answers: question.answers.map((answer) => ({
        ...answer,
        timestamp: answer.timestamp?.toISOString(),
      })),
    }));
    setQuestions(formattedQuestions);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    setLoading(true);
    try {
      await submitQuestion({
        quiz: newQuestion,
        contributor: `${user.firstName} ${user.lastName}`,
        contributorId: user.id,
      });
      setNewQuestion("");
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to submit question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (questionId: number) => {
    const answer = newAnswers[questionId];
    if (!answer?.trim() || !user) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleApproveQuestion = async (id: number) => {
    await approveQuestion(id);
    fetchQuestions();
  };

  const handleDisapproveQuestion = async (id: number) => {
    await disapproveQuestion(id);
    fetchQuestions();
  };

  const handleApproveAnswer = async (answerId: number) => {
    await approveAnswer(answerId);
    fetchQuestions();
  };

  const handleDisapproveAnswer = async (answerId: number) => {
    await disapproveAnswer(answerId);
    fetchQuestions();
  };

  // Filter questions based on user role
  const displayQuestions = isAdminOrLab
    ? questions
    : questions.filter((q) => q.approved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Medical Q&A</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ask questions about medical tests, procedures, and get answers from
            our laboratory experts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ask Question Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Ask a Question
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Share your medical questions with our community
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your question here... (e.g., What does my blood test result mean?)"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg min-h-[120px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "Please sign in to ask questions"}
                    </div>
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={!newQuestion.trim() || !user || loading}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Question
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Community Questions
                <Badge variant="secondary" className="ml-2">
                  {displayQuestions.length}
                </Badge>
              </h2>

              {displayQuestions.length === 0 ? (
                <Card className="text-center py-12 shadow-xl border-0 bg-white/90">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-400">
                    Be the first to ask a question about medical tests and
                    procedures.
                  </p>
                </Card>
              ) : (
                displayQuestions.map((question) => (
                  <QuestionCard
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
                    onQuestionApproved={
                      isAdminOrLab ? handleApproveQuestion : undefined
                    }
                    onQuestionDisapproved={
                      isAdminOrLab ? handleDisapproveQuestion : undefined
                    }
                    onAnswerApproved={
                      isAdminOrLab ? handleApproveAnswer : undefined
                    }
                    onAnswerDisapproved={
                      isAdminOrLab ? handleDisapproveAnswer : undefined
                    }
                    showModeration={isAdminOrLab}
                    loading={loading}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg mt-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Be Respectful
                      </h4>
                      <p className="text-sm text-gray-600">
                        Maintain a professional and respectful tone
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Clear Questions
                      </h4>
                      <p className="text-sm text-gray-600">
                        Provide context for better answers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg mt-1">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Privacy First
                      </h4>
                      <p className="text-sm text-gray-600">
                        Avoid sharing personal health information
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            {user && (
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge
                        variant={
                          userRole === "admin"
                            ? "destructive"
                            : userRole === "laboratory"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Questions Asked:</span>
                      <span className="font-semibold">
                        {
                          questions.filter((q) => q.contributorId === user.id)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Answers Given:</span>
                      <span className="font-semibold">
                        {
                          questions
                            .flatMap((q) => q.answers)
                            .filter((a) => a.contributorId === user.id).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({
  question,
  newAnswer,
  onNewAnswerChange,
  onAnswerSubmit,
  onQuestionApproved,
  onQuestionDisapproved,
  onAnswerApproved,
  onAnswerDisapproved,
  showModeration,
  loading,
}: any) {
  const { user } = useUser();
  const canAnswer = user && (showModeration || question.approved);

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {question.quiz}
              </h3>
              {showModeration && (
                <div className="flex gap-1">
                  {question.approved ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
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

          {/* Moderation Actions */}
          {showModeration && (
            <div className="flex gap-2">
              {!question.approved && (
                <Button
                  size="sm"
                  onClick={() => onQuestionApproved(question.id)}
                  className="bg-green-600 hover:bg-green-700 h-8 px-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onQuestionDisapproved(question.id)}
                className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Answers (
            {
              question.answers.filter((a: any) => showModeration || a.approved)
                .length
            }
            )
          </h4>

          {/* Answers List */}
          {question.answers
            .filter((answer: any) => showModeration || answer.approved)
            .map((answer: any) => (
              <div
                key={answer.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
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
                      {answer.approved && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Answer Moderation */}
                  {showModeration && (
                    <div className="flex gap-2 ml-4">
                      {!answer.approved && (
                        <Button
                          size="sm"
                          onClick={() => onAnswerApproved(answer.id)}
                          className="bg-green-600 hover:bg-green-700 h-7 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAnswerDisapproved(answer.id)}
                        className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Add Answer Form */}
          {canAnswer && (
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
                  placeholder="Type your answer here..."
                  value={newAnswer}
                  onChange={(e) => onNewAnswerChange(e.target.value)}
                  rows={3}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={onAnswerSubmit}
                    disabled={!newAnswer.trim() || loading}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {loading ? (
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
