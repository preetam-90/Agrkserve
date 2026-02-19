export function safeGsapRevert(context: gsap.Context | null | undefined) {
  if (!context) return;

  try {
    context.revert();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return;
    }

    throw error;
  }
}
