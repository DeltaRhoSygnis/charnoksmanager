import { useCallback, useRef } from 'react';

export const useAnimations = () => {
  const animationRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const triggerAnimation = useCallback((element: HTMLElement, animationClass: string, duration = 300) => {
    if (!element) return;

    const animationId = `${element.id || 'element'}-${Date.now()}`;
    
    // Clear any existing animation
    if (animationRefs.current.has(animationId)) {
      clearTimeout(animationRefs.current.get(animationId));
    }

    // Add animation class
    element.classList.add(animationClass);

    // Remove animation class after duration
    const timeoutId = setTimeout(() => {
      element.classList.remove(animationClass);
      animationRefs.current.delete(animationId);
    }, duration);

    animationRefs.current.set(animationId, timeoutId);
  }, []);

  const addButtonAnimation = useCallback((element: HTMLElement) => {
    if (!element) return;
    element.classList.add('btn-animated');
  }, []);

  const addCardAnimation = useCallback((element: HTMLElement) => {
    if (!element) return;
    element.classList.add('card-animated');
  }, []);

  const addInputAnimation = useCallback((element: HTMLElement) => {
    if (!element) return;
    element.classList.add('input-animated', 'focus-ring');
  }, []);

  const triggerSuccess = useCallback((element: HTMLElement) => {
    triggerAnimation(element, 'success-animated', 500);
  }, [triggerAnimation]);

  const triggerError = useCallback((element: HTMLElement) => {
    triggerAnimation(element, 'error-animated', 500);
  }, [triggerAnimation]);

  const triggerCounterUpdate = useCallback((element: HTMLElement) => {
    triggerAnimation(element, 'updating', 300);
  }, [triggerAnimation]);

  const addRippleEffect = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple-effect 0.6s ease-out;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  const cleanup = useCallback(() => {
    animationRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    animationRefs.current.clear();
  }, []);

  return {
    triggerAnimation,
    addButtonAnimation,
    addCardAnimation,
    addInputAnimation,
    triggerSuccess,
    triggerError,
    triggerCounterUpdate,
    addRippleEffect,
    cleanup
  };
};

export default useAnimations;