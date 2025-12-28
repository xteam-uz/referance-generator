'use client';

import ReferenceList from '@/components/ReferenceList';
import CreateReferenceForm from '@/components/CreateReferenceForm';

export default function ReferencesPage() {

    return (
        <div className="container mx-auto p-4 pb-20">
            <h1 className="text-2xl font-bold mb-4">References</h1>
            <CreateReferenceForm />
            <div className="mt-8">
                <ReferenceList />
            </div>
        </div>
    );
}

