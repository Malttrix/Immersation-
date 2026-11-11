export type ReviewAction = 'approve' | 'reject' | 'request_revision';
export const actionStatus: Record<ReviewAction, string> = {
  approve: 'approved', reject: 'rejected', request_revision: 'revision_requested',
};

export function validateReviewResponse(value: any, submissionId: string, revision: number, action: ReviewAction) {
  if (!value || value.submissionId !== submissionId || value.revision !== revision || value.status !== actionStatus[action]) {
    throw Error('The review response could not be verified. Reload the article before trying again.');
  }
}

export function reviewError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return /revision conflict|40001/i.test(message)
    ? 'This article changed in another session. Reopen the latest revision before reviewing or publishing.'
    : message || 'The action could not be confirmed. Reload before trying again.';
}
