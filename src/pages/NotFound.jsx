import React from 'react';
import { PageMeta, PageHeader, Button } from '../components/ui';

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page not found" />
      <PageHeader
        title="This page doesn’t exist"
        lead="The link may be old or mistyped. Here are the places most people are looking for."
      >
        <Button to="/" arrow>Home</Button>
        <Button to="/products/agrosense360" variant="secondary">AgroSense360</Button>
        <Button to="/services" variant="secondary">Services</Button>
        <Button to="/contact" variant="secondary">Contact</Button>
      </PageHeader>
      <div className="bg-canvas h-24" />
    </>
  );
}
