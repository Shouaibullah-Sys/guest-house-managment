"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Question } from "@/types/types";

interface Props {
  question: Question;
  onQuestionApproved: (id: number) => void;
  onQuestionDisapproved: (id: number) => void;
  onAnswerApproved: (answerId: number) => void;
  onAnswerDisapproved: (answerId: number) => void;
}

export default function QuestionCard({
  question,
  onQuestionApproved,
  onQuestionDisapproved,
  onAnswerApproved,
  onAnswerDisapproved,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{question.quiz}</span>
              <ApprovalBadge approved={question.approved} />
            </div>

            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  question.id !== null && onQuestionApproved(question.id)
                }
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  question.id !== null && onQuestionDisapproved(question.id)
                }
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <span>{question.contributor}</span>
            <span> • </span>
            <span>{question.timestamp && formatDate(question.timestamp)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 font-semibold">Answers:</h3>
        {question.answers && question.answers.length > 0 ? (
          <ul className="space-y-4">
            {question.answers.map((answer) => (
              <li key={answer.id} className="flex flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{answer.ans}</span>
                    <ApprovalBadge approved={answer.approved ?? null} />
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (question.id !== null && answer.id !== null) {
                          onAnswerApproved(answer.id);
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (question.id !== null && answer.id !== null) {
                          onAnswerDisapproved(answer.id);
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <span>{answer.contributor}</span>
                  <span> • </span>
                  <span>
                    {answer.timestamp && formatDate(answer.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No answers yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalBadge({ approved }: { approved: boolean | null }) {
  if (approved === true) {
    return (
      <Badge
        variant="outline"
        className="border-green-300 bg-green-100 text-green-800"
      >
        Approved
      </Badge>
    );
  } else if (approved === false) {
    return (
      <Badge
        variant="outline"
        className="border-red-300 bg-red-100 text-red-800"
      >
        Disapproved
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="border-yellow-300 bg-yellow-100 text-yellow-800"
      >
        Pending
      </Badge>
    );
  }
}
