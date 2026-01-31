import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  labelClassName?: string;
  inputClassName?: string;
}

/**
 * An accessible form field component that includes:
 * - Proper label association
 * - Error message with aria-describedby
 * - Hint text support
 * - Optional icon
 * - ARIA invalid state
 */
export const AccessibleFormField = forwardRef<HTMLInputElement, AccessibleFormFieldProps>(
  ({ 
    label, 
    error, 
    hint, 
    icon,
    id: providedId,
    required,
    className,
    labelClassName,
    inputClassName,
    ...props 
  }, ref) => {
    // Generate unique IDs for accessibility
    const id = providedId || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    
    // Build aria-describedby based on what's present
    const describedBy = [
      error && errorId,
      hint && hintId,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('space-y-2', className)}>
        <Label 
          htmlFor={id} 
          className={cn('flex items-center gap-2', labelClassName)}
        >
          {icon && (
            <span className="text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          )}
          {label}
          {required && (
            <span className="text-destructive" aria-label="required">*</span>
          )}
        </Label>
        
        <Input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            inputClassName
          )}
          {...props}
        />
        
        {hint && !error && (
          <p 
            id={hintId} 
            className="text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-destructive" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';

export default AccessibleFormField;
