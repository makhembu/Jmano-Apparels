# Estimated Infrastructure Costs (100 users/min)

## Current (Hobby/Free)
- **Hosting:** $0
- **Database:** $0
- **Total:** $0
- **Risk:** **100% Failure Probability** (Bandwidth/Auth limits)

## Recommended Scale (Black Friday Ready)
| Service | Plan | Cost | Reason |
|---------|------|------|--------|
| **Vercel** | Pro | $20/mo | 1TB Bandwidth (vs 100GB). Prevents site shutdown due to image traffic. |
| **Supabase** | Pro | $25/mo | 100k MAU (vs 50k), 8GB Database, Daily Backups. |
| **Email (Resend)** | Growth | $35/mo | Free tier sends 3k emails/mo. You need ~6k emails/hour capacity. |
| **Sentry** | Team | $29/mo | Error monitoring to catch 500 errors in real-time. |
| **Total** | | **~$109/mo** | |

## Enterprise Scale (1000+ users/min)
*If you grow 10x beyond this target:*
- **Supabase Team:** $599/mo
- **Vercel Enterprise:** Custom pricing
- **Redis (Upstash):** $100+/mo for caching
- **Total:** ~$1000+/mo
