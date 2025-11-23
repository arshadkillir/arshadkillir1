
import prisma from '../prismaClient.js';
async function run(){ console.log('Sync job start'); const pending = await prisma.syncQueue.findMany({ where: { status: 'pending' }, take: 100 }); for(const s of pending){ try{ console.log('Sync', s.id); await prisma.syncQueue.update({ where: { id: s.id }, data: { status: 'done' } }); }catch(e){ console.error('sync failed', e); await prisma.syncQueue.update({ where: { id: s.id }, data: { status: 'failed' } }); } } await prisma.$disconnect(); }
run().catch(e=>{ console.error(e); process.exit(1); });
