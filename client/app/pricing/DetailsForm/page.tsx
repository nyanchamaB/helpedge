'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

import UserDetails from '../userInfo/page';
import AddressDetails from '../addressInfo/page';
import PaymentInfo from '../paymentInfo/payment';
import NavHeader from '../../onboarding/navsection';

const steps = ['User Information', 'Address Information', 'Payment Information'];

export default function StepperComponent() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => step === 1;
  const isStepSkipped = (step: number) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;

    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }
    setActiveStep((prev) => prev + 1);
    setSkipped((prev) => new Set(prev).add(activeStep));
  };

  const handleReset = () => setActiveStep(0);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserDetails />;
      case 1:
        return <AddressDetails />;
      case 2:
        return <PaymentInfo />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <>
      <NavHeader />
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="p-6">
          {/* Step Indicators */}
          <div className="flex justify-between mb-6">
            {steps.map((label, index) => {
              const isCompleted = activeStep > index && !isStepSkipped(index);
              const isActive = activeStep === index;

              return (
                <div key={label} className="flex-1 text-center">
                  <Badge
                    variant={isActive ? 'secondary' : isCompleted ? 'outline' : 'default'}
                    className="w-8 h-8 mx-auto mb-2 flex items-center justify-center"
                  >
                    {isCompleted ? <Check size={16} /> : index + 1}
                  </Badge>
                  <div className={`text-sm ${isActive ? 'font-semibold' : ''}`}>
                    {label}
                    {isStepOptional(index) && (
                      <span className="block text-xs text-muted-foreground">Optional</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="mb-6" />

          {/* Step Content */}
          <div>{renderStepContent(activeStep)}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={activeStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </Button>

            <div className="flex gap-2">
              {isStepOptional(activeStep) && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleNext}>Finish</Button>
              ) : (
                <Button onClick={handleNext}>
                  Next <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Completed State */}
          {activeStep === steps.length && (
            <div className="mt-6 text-center">
              <p className="mb-4">All steps completed, you&apos;ve finished!</p>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
