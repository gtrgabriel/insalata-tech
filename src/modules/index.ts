import { lazy } from 'react';

export const MODULES = [
  { id: '01', slug: 'executive', title: 'Executive Experience', short: 'Visão executiva', C: lazy(() => import('./M01Executive')) },
  { id: '02', slug: 'ecosystem', title: 'Business Ecosystem', short: 'Ecossistema', C: lazy(() => import('./M02Ecosystem')) },
  { id: '03', slug: 'as-is', title: 'Current State · AS-IS', short: 'Estado atual', C: lazy(() => import('./M03AsIs')) },
  { id: '04', slug: 'to-be', title: 'Target Architecture · TO-BE', short: 'Arquitetura-alvo', C: lazy(() => import('./M04ToBe')) },
  { id: '05', slug: 'estoca', title: 'Estoca.ai Integration', short: 'Estoca.ai', C: lazy(() => import('./M05Estoca')) },
  { id: '06', slug: 'cockpit', title: 'Intelligence Cockpit', short: 'Cockpit', C: lazy(() => import('./M06Cockpit')) },
  { id: '07', slug: 'ai', title: 'AI & Automation', short: 'IA aplicada', C: lazy(() => import('./M07AI')) },
  { id: '08', slug: 'modernization', title: 'Legacy Modernization', short: 'Modernização', C: lazy(() => import('./M08Modernization')) },
  { id: '09', slug: 'roadmap', title: 'Transformation Roadmap', short: 'Roadmap', C: lazy(() => import('./M09Roadmap')) },
  { id: '10', slug: 'business-case', title: 'Business Case & Partnership', short: 'Business case', C: lazy(() => import('./M10BusinessCase')) },
] as const;
