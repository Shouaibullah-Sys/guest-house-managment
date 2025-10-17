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
  User,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Question } from "@/types/types";
import { submitQuestion, getApprovedQuestionsWithAnswers } from "./actions";

export default function PatientQAPage() {
  const { user, isLoaded } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      fetchQuestions();
    }
  }, [isLoaded]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getApprovedQuestionsWithAnswers();
      // Only show questions that have at least one approved answer
      const answeredQuestions = questionsData.filter(
        (q) => q.approved && q.answers.some((a) => a.approved)
      );

      // Convert Date | null timestamps to strings to match Question interface
      const formattedQuestions = answeredQuestions.map((question) => ({
        ...question,
        timestamp: question.timestamp
          ? new Date(question.timestamp).toISOString()
          : undefined,
        answers: question.answers.map((answer) => ({
          ...answer,
          timestamp: answer.timestamp
            ? new Date(answer.timestamp).toISOString()
            : undefined,
        })),
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    setSubmitting(true);
    try {
      await submitQuestion({
        quiz: newQuestion,
        contributor: `${user.firstName} ${user.lastName}`,
        contributorId: user.id,
      });
      setNewQuestion("");
      // Show success message
      alert("سوال شما ارسال شد! تیم کلینیک ما به زودی به آن پاسخ خواهد داد.");
    } catch (error) {
      console.error("Failed to submit question:", error);
      alert("ارسال سوال ناموفق بود. لطفاً دوباره امتحان کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50"
      dir="rtl"
    >
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              سوال و جواب بیماران
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            در مورد آزمایش‌های پزشکی و روش‌های درمانی سوال بپرسید. تیم کلینیک ما
            پاسخ خواهد داد.
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
                  سوال بپرسید
                </CardTitle>
                <CardDescription className="text-blue-100">
                  سوالاتی در مورد آزمایش‌های پزشکی دارید؟ از متخصصان ما بپرسید!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="سوال خود را اینجا بنویسید... (برای مثال: در طول آزمایش خون باید منتظر چه چیزی باشم؟ چطور برای MRI آماده شوم؟)"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    dir="rtl"
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg min-h-[120px] text-right"
                    style={{ direction: "rtl" }}
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={!newQuestion.trim() || !user || submitting}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      {submitting ? (
                        <>
                          در حال ارسال...
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        </>
                      ) : (
                        <>
                          ارسال سوال
                          <Send className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "لطفاً برای پرسیدن سوال وارد شوید"}
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      سوال شما توسط تیم کلینیک بررسی و پاسخ داده خواهد شد. بعداً
                      برای دیدن پاسخ مراجعه کنید.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answered Questions */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                سوالات پاسخ داده شده
                <Badge variant="secondary" className="mr-2">
                  {questions.length}
                </Badge>
              </h2>

              {loading ? (
                <Card className="text-center py-12 shadow-xl border-0 bg-white/90">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">در حال بارگذاری سوالات...</p>
                </Card>
              ) : questions.length === 0 ? (
                <Card className="text-center py-12 shadow-xl border-0 bg-white/90">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    هنوز هیچ سوال پاسخ داده شده‌ای وجود ندارد
                  </h3>
                  <p className="text-gray-400">
                    اولین نفری باشید که سوال می‌پرسد! تیم ما پاسخ خواهد داد.
                  </p>
                </Card>
              ) : (
                questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
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
                  <CheckCircle className="h-5 w-5" />
                  چگونه کار می‌کند
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        سوال خود را بپرسید
                      </h4>
                      <p className="text-sm text-gray-600">
                        هر سوالی در مورد آزمایش‌های پزشکی یا روش‌های درمانی
                        ارسال کنید
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg mt-1">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        تیم کلینیک بررسی می‌کند
                      </h4>
                      <p className="text-sm text-gray-600">
                        متخصصان پزشکی ما سوال شما را بررسی و پاسخ خواهند داد
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg mt-1">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        پاسخ خود را دریافت کنید
                      </h4>
                      <p className="text-sm text-gray-600">
                        برای دیدن سوال و پاسخ تایید شده مراجعه کنید
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
                    پروفایل شما
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
                      <Badge variant="secondary">بیمار</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>سوالات پرسیده شده:</span>
                      <span className="font-semibold">
                        {
                          questions.filter((q) => q.contributorId === user.id)
                            .length
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

// Simple Question Card for Patients (read-only)
function QuestionCard({ question }: any) {
  const approvedAnswers = question.answers.filter((a: any) => a.approved);

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {question.quiz}
            </h3>
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 border-green-200"
            >
              پاسخ داده شده
              <CheckCircle className="h-3 w-3 ml-1" />
            </Badge>
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

        {/* Answers Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            پاسخ کلینیک
          </h4>

          {/* Approved Answers */}
          {approvedAnswers.map((answer: any) => (
            <div
              key={answer.id}
              className="bg-green-50 rounded-xl p-4 border border-green-200"
            >
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{answer.ans}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      تیم کلینیک
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(answer.timestamp!).toLocaleDateString()}
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      پاسخ تایید شده
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
