import React from 'react';
import { PageMeta, PageHeader } from '../components/ui';
import AgroSense360Survey from './AgroSense360-Survey';
import { IMG } from '../content/site';

export default function Survey() {
  return (
    <>
      <PageMeta
        title="AgroSense360 survey"
        path="/products/agrosense360/survey"
        description="Tell BLOXio how you monitor your farm today and join the AgroSense360 pilot list. Seven short steps, about four minutes."
      />
      <PageHeader
        image={IMG.field}
        label="AgroSense360 · Pilot survey"
        title="Help shape AgroSense360"
        lead="Seven short steps, about four minutes. Your answers decide which problems we solve first, and put you on the list for the pilot."
      />
      <section className="bg-canvas">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 md:py-16">
          <AgroSense360Survey />
        </div>
      </section>
    </>
  );
}
