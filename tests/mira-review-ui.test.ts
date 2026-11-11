import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewError, validateReviewResponse } from '../src/lib/mira-review';
import { supabaseArticleRepository } from '../src/lib/article-studio';

test('review responses must match submission, action and exact revision', () => {
  validateReviewResponse({submissionId:'s',status:'approved',revision:6}, 's', 6, 'approve');
  assert.throws(() => validateReviewResponse({submissionId:'s',status:'approved',revision:5}, 's', 6, 'approve'));
  assert.throws(() => validateReviewResponse({submissionId:'other',status:'approved',revision:6}, 's', 6, 'approve'));
  assert.throws(() => validateReviewResponse(null, 's', 6, 'approve'));
});
test('review details can be refreshed after a confirmed decision', async () => {
  let status = 'pending_review';
  const repo = supabaseArticleRepository({rpc: async (name: string) => name === 'mira_review'
    ? (status = 'approved', {data:{submissionId:'s',status,revision:6},error:null})
    : ({data:{status,approvedRevision:6},error:null})});
  assert.equal((await repo.reviewDetails!('article')).status, 'pending_review');
  const result = await repo.review!('article',6,'approve');
  validateReviewResponse(result,'s',6,'approve');
  assert.deepEqual(await repo.reviewDetails!('article'),{status:'approved',approvedRevision:6});
});
test('stale revision errors are explicit and RPC is invoked with exact revision', async () => {
  let input: any;
  const repo = supabaseArticleRepository({rpc: async (name: string, args: any) => {input={name,args}; return {data:null,error:{code:'40001',message:'conflict'}};}});
  await assert.rejects(() => repo.review!('article',6,'approve'), /revision conflict/);
  assert.deepEqual(input,{name:'mira_review',args:{p_article:'article',p_revision:6,p_action:'approve'}});
  assert.match(reviewError(new Error('Article revision conflict')), /changed in another session/);
});
