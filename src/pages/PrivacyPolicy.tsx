import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calculator
        </Link>

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Be Connect collects your contact information (name, email, phone,
            property details) to:
          </p>

          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Calculate your staff turnover costs</li>
            <li>Provide workforce stability recommendations</li>
            <li>Contact you about our platform</li>
          </ul>

          <p>
            Your data is stored securely and only used for these purposes.
          </p>

          <p>
            You can request deletion at any time by contacting{" "}
            <a
              href="mailto:privacy@beconnect.ie"
              className="text-primary hover:underline"
            >
              privacy@beconnect.ie
            </a>
          </p>

          <div className="border-t border-border pt-6 mt-8">
            <p className="text-sm">
              <strong className="text-foreground">Data Controller:</strong> Be
              Connect Ltd, Ireland
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
