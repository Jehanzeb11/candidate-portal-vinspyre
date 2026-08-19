import React from "react";
import { ScreenShareGuard } from "@/components/ScreenShareGuard";
import { ContentProtection } from "@/components/ContentProtection";

export default function ProtectedPage() {
  return (
    <ScreenShareGuard>
      <ContentProtection>
        <div className="mx-auto max-w-4xl p-8">
          <header className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Highly Sensitive Dashboard</h1>
            <p className="text-gray-500">Confidential information below.</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Financial Data</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Q3 Revenue</span>
                  <span className="font-mono font-medium">$4,250,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Projected Q4</span>
                  <span className="font-mono font-medium">$5,100,000</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Trade Secrets</h2>
              <p className="text-sm leading-relaxed text-gray-700">
                The secret formula involves mixing exactly 3 parts of component A with 
                7 parts of component B under exactly 42 degrees Celsius. Any deviation 
                will result in catastrophic failure of the product integrity.
              </p>
            </div>
          </div>
          
          <div className="mt-8 rounded-lg bg-blue-50 p-6 text-blue-900">
            <h3 className="mb-2 font-semibold">Security Notice</h3>
            <p className="text-sm">
              This page is protected. Leaving this tab, minimizing the window, or attempting 
              to take a screenshot will temporarily obscure the content. You are currently 
              required to share your screen to access this information.
            </p>
          </div>
        </div>
      </ContentProtection>
    </ScreenShareGuard>
  );
}
