<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\EducationRecord;
use App\Models\PersonalInformation;
use App\Models\Relative;
use App\Models\WorkExperience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Browsershot\Browsershot;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $documents = Document::where('user_id', $user->id)
            ->with(['personalInformation', 'educationRecords', 'relatives'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
            'message' => 'Documents retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'document_type' => 'required|in:obyektivka,ishga_olish_ariza,kochirish_ariza',
            // personal information
            'personal_information' => 'required|array',
            'personal_information.familya' => 'required|string|max:255',
            'personal_information.ism' => 'required|string|max:255',
            'personal_information.sharif' => 'required|string|max:255',
            'personal_information.tugilgan_sana' => 'required|date',
            'personal_information.tugilgan_joyi' => 'required|string|max:255',
            'personal_information.millati' => 'required|string|max:255',
            'personal_information.partiyaviyligi' => 'nullable|string|max:255',
            'personal_information.xalq_deputatlari' => 'nullable|string',
            // work experiences
            'work_experiences' => 'required|array',
            'work_experiences.*.start_date' => 'required|date',
            'work_experiences.*.end_date' => 'nullable|date',
            'work_experiences.*.info' => 'required|string|max:255',
            // education records
            'education_records' => 'required|array',
            'education_records.*.malumoti' => 'required|in:Олий,Махсус,Ўрта',
            'education_records.*.tamomlagan' => 'nullable|string|max:255',
            'education_records.*.mutaxassisligi' => 'nullable|string|max:255',
            'education_records.*.ilmiy_daraja' => 'nullable|string|max:255',
            'education_records.*.ilmiy_unvoni' => 'nullable|string|max:255',
            'education_records.*.chet_tillari' => 'nullable|string|max:255',
            'education_records.*.maxsus_unvoni' => 'nullable|string|max:255',
            'education_records.*.davlat_mukofoti' => 'nullable|string|max:255',
            // relatives
            'relatives' => 'required|array',
            'relatives.*.qarindoshligi' => 'required|in:Otasi,Onasi,Akasi,Ukasi,Opasi',
            'relatives.*.fio' => 'required|string|max:255',
            'relatives.*.tugilgan' => 'required|string|max:255',
            'relatives.*.vafot_etgan' => 'boolean',
            'relatives.*.ish_joyi' => 'nullable|string|max:500',
            'relatives.*.turar_joyi' => 'nullable|string|max:255',
            'relatives.*.vafot_etgan_yili' => 'nullable|string|max:255',
            'relatives.*.kasbi' => 'nullable|string|max:255',
        ];

        // Photo validatsiyasi - faqat fayl yuborilganda tekshiriladi
        if ($request->hasFile('photo')) {
            $rules['photo'] = 'required|image|mimes:jpeg,jpg,png|max:5120';
        }

        $validator = Validator::make($request->all(), $rules);

        // Custom validation: vafot_etgan true bo'lsa vafot_etgan_yili va kasbi required
        // vafot_etgan false bo'lsa ish_joyi va turar_joyi required
        if ($request->has('relatives')) {
            foreach ($request->relatives as $index => $relative) {
                if (isset($relative['vafot_etgan']) && $relative['vafot_etgan']) {
                    if (empty($relative['vafot_etgan_yili'])) {
                        $validator->errors()->add("relatives.{$index}.vafot_etgan_yili", "Vafot etgan yili to'ldirilishi shart.");
                    }
                    if (empty($relative['kasbi'])) {
                        $validator->errors()->add("relatives.{$index}.kasbi", "Kasbi to'ldirilishi shart.");
                    }
                } else {
                    if (empty($relative['ish_joyi'])) {
                        $validator->errors()->add("relatives.{$index}.ish_joyi", "Ish joyi va lavozimi to'ldirilishi shart.");
                    }
                    if (empty($relative['turar_joyi'])) {
                        $validator->errors()->add("relatives.{$index}.turar_joyi", "Turar joyi to'ldirilishi shart.");
                    }
                }
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();

            // Create document
            $document = Document::create([
                'user_id' => $user->id,
                'document_type' => $request->document_type,
                'status' => 'draft',
            ]);

            // Handle photo upload
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');

                // Check if file is valid
                if (!$photo->isValid()) {
                    DB::rollBack();
                    $errorCode = $photo->getError();
                    $errorMessage = $photo->getErrorMessage();

                    // Common PHP upload errors
                    $errorMessages = [
                        UPLOAD_ERR_INI_SIZE => 'Fayl hajmi PHP sozlamalaridagi maksimal hajmdan oshib ketdi (upload_max_filesize: ' . ini_get('upload_max_filesize') . ')',
                        UPLOAD_ERR_FORM_SIZE => 'Fayl hajmi formadagi maksimal hajmdan oshib ketdi',
                        UPLOAD_ERR_PARTIAL => 'Fayl qisman yuklandi',
                        UPLOAD_ERR_NO_FILE => 'Fayl yuklanmadi',
                        UPLOAD_ERR_NO_TMP_DIR => 'Vaqtincha saqlash papkasi topilmadi',
                        UPLOAD_ERR_CANT_WRITE => 'Diskga yozishda xatolik',
                        UPLOAD_ERR_EXTENSION => "Fayl yuklash PHP kengaytmasi tomonidan to'xtatildi",
                    ];

                    return response()->json([
                        'success' => false,
                        'message' => 'Fayl yuklashda xatolik',
                        'error' => $errorMessages[$errorCode] ?? $errorMessage,
                        'upload_max_filesize' => ini_get('upload_max_filesize'),
                        'post_max_size' => ini_get('post_max_size'),
                        'file_size' => $photo->getSize() ? number_format($photo->getSize() / 1024 / 1024, 2) . ' MB' : "Noma'lum",
                    ], 422);
                }

                try {
                    $photoPath = $photo->store('photos', 'public');
                } catch (\Exception $e) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Fayl saqlashda xatolik',
                        'error' => $e->getMessage(),
                    ], 422);
                }
            }

            // Create personal information
            $personalInfoData = $request->personal_information;
            $personalInfoData['document_id'] = $document->id;
            if ($photoPath) {
                $personalInfoData['photo_path'] = $photoPath;
            }
            // Ensure new fields are included (convert empty strings to null)
            $personalInfoData['partiyaviyligi'] = !empty($personalInfoData['partiyaviyligi'] ?? null)
                ? $personalInfoData['partiyaviyligi']
                : null;
            $personalInfoData['xalq_deputatlari'] = !empty($personalInfoData['xalq_deputatlari'] ?? null)
                ? $personalInfoData['xalq_deputatlari']
                : null;
            // Remove fields that don't exist in personal_information table
            unset($personalInfoData['malumoti']);
            unset($personalInfoData['malumoti_boyicha_mutaxassisligi']);
            unset($personalInfoData['qaysi_chet_tillarini_biladi']);
            PersonalInformation::create($personalInfoData);

            // Create education records
            foreach ($request->education_records as $index => $educationRecord) {
                EducationRecord::create([
                    'document_id' => $document->id,
                    'malumoti' => $educationRecord['malumoti'],
                    'tamomlagan' => $educationRecord['tamomlagan'] ?? null,
                    'mutaxassisligi' => $educationRecord['mutaxassisligi'] ?? null,
                    'ilmiy_daraja' => $educationRecord['ilmiy_daraja'] ?? null,
                    'ilmiy_unvoni' => $educationRecord['ilmiy_unvoni'] ?? null,
                    'chet_tillari' => $educationRecord['chet_tillari'] ?? null,
                    'maxsus_unvoni' => $educationRecord['maxsus_unvoni'] ?? null,
                    'davlat_mukofoti' => $educationRecord['davlat_mukofoti'] ?? null,
                    'order_index' => $index,
                ]);
            }

            // Create relatives
            foreach ($request->relatives as $index => $relative) {
                $vafotEtgan = $relative['vafot_etgan'] ?? false;
                Relative::create([
                    'document_id' => $document->id,
                    'qarindoshligi' => $relative['qarindoshligi'],
                    'fio' => $relative['fio'],
                    'tugilgan' => $relative['tugilgan'],
                    'vafot_etgan' => $vafotEtgan,
                    'ish_joyi' => $vafotEtgan ? null : ($relative['ish_joyi'] ?? null),
                    'turar_joyi' => $vafotEtgan ? null : ($relative['turar_joyi'] ?? null),
                    'vafot_etgan_yili' => $vafotEtgan ? ($relative['vafot_etgan_yili'] ?? null) : null,
                    'kasbi' => $vafotEtgan ? ($relative['kasbi'] ?? null) : null,
                    'order_index' => $index,
                ]);
            }

            // Create work experiences
            foreach ($request->work_experiences as $index => $workExperience) {
                WorkExperience::create([
                    'document_id' => $document->id,
                    'start_date' => $workExperience['start_date'],
                    'end_date' => !empty($workExperience['end_date'] ?? null) ? $workExperience['end_date'] : null,
                    'info' => $workExperience['info'],
                    'order_index' => $index,
                ]);
            }

            // Update status to 'completed' if all required data is present
            // (This is optional - you can also let user manually set status to 'completed')
            // For now, we keep it as 'draft' and let user update it manually

            DB::commit();

            $document->load(['personalInformation', 'educationRecords', 'relatives', 'workExperiences']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create document',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $document = Document::with(['personalInformation', 'educationRecords', 'relatives', 'workExperiences'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $document = Document::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'document_type' => 'sometimes|in:obyektivka,ishga_olish_ariza,kochirish_ariza',
            'status' => 'sometimes|string',
            'personal_information' => 'sometimes|array',
            'personal_information.familya' => 'sometimes|string|max:255',
            'personal_information.ism' => 'sometimes|string|max:255',
            'personal_information.sharif' => 'sometimes|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
            'personal_information.joriy_lavozim_sanasi' => 'sometimes|string|max:255',
            'personal_information.joriy_lavozim_toliq' => 'sometimes|string|max:500',
            'personal_information.tugilgan_sana' => 'sometimes|date',
            'personal_information.tugilgan_joyi' => 'sometimes|string|max:255',
            'personal_information.millati' => 'sometimes|string|max:255',
            'personal_information.partiyaviyligi' => 'nullable|string|max:255',
            'personal_information.xalq_deputatlari' => 'nullable|string',
            // work experiences
            'work_experiences' => 'sometimes|array',
            'work_experiences.*.start_date' => 'sometimes|date',
            'work_experiences.*.end_date' => 'nullable|date',
            'work_experiences.*.info' => 'sometimes|string|max:255',
            // education records
            'education_records' => 'sometimes|array',
            'education_records.*.malumoti' => 'sometimes|in:Олий,Махсус,Ўрта',
            'education_records.*.tamomlagan' => 'nullable|string|max:255',
            'education_records.*.mutaxassisligi' => 'nullable|string|max:255',
            'education_records.*.ilmiy_daraja' => 'nullable|string|max:255',
            'education_records.*.ilmiy_unvoni' => 'nullable|string|max:255',
            'education_records.*.chet_tillari' => 'nullable|string|max:255',
            'education_records.*.maxsus_unvoni' => 'nullable|string|max:255',
            'education_records.*.davlat_mukofoti' => 'nullable|string|max:255',
            // relatives
            'relatives' => 'sometimes|array',
            'relatives.*.qarindoshligi' => 'sometimes|in:Otasi,Onasi,Akasi,Ukasi,Opasi',
            'relatives.*.fio' => 'sometimes|string|max:255',
            'relatives.*.tugilgan' => 'sometimes|string|max:255',
            'relatives.*.vafot_etgan' => 'boolean',
            'relatives.*.ish_joyi' => 'nullable|string|max:500',
            'relatives.*.turar_joyi' => 'nullable|string|max:255',
            'relatives.*.vafot_etgan_yili' => 'nullable|string|max:255',
            'relatives.*.kasbi' => 'nullable|string|max:255',
        ]);

        // Custom validation: vafot_etgan true bo'lsa vafot_etgan_yili va kasbi required
        // vafot_etgan false bo'lsa ish_joyi va turar_joyi required
        if ($request->has('relatives')) {
            foreach ($request->relatives as $index => $relative) {
                if (isset($relative['vafot_etgan']) && $relative['vafot_etgan']) {
                    if (empty($relative['vafot_etgan_yili'])) {
                        $validator->errors()->add("relatives.{$index}.vafot_etgan_yili", "Vafot etgan yili to'ldirilishi shart.");
                    }
                    if (empty($relative['kasbi'])) {
                        $validator->errors()->add("relatives.{$index}.kasbi", "Kasbi to'ldirilishi shart.");
                    }
                } else {
                    if (empty($relative['ish_joyi'])) {
                        $validator->errors()->add("relatives.{$index}.ish_joyi", "Ish joyi va lavozimi to'ldirilishi shart.");
                    }
                    if (empty($relative['turar_joyi'])) {
                        $validator->errors()->add("relatives.{$index}.turar_joyi", "Turar joyi to'ldirilishi shart.");
                    }
                }
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update document
            if ($request->has('document_type') || $request->has('status')) {
                $document->update($request->only(['document_type', 'status']));
            }

            // Update personal information
            if ($request->has('personal_information')) {
                $personalInfo = $document->personalInformation;
                $personalInfoData = $request->personal_information;

                // Handle photo upload
                if ($request->hasFile('photo')) {
                    $photo = $request->file('photo');
                    $photoPath = $photo->store('photos', 'public');
                    $personalInfoData['photo_path'] = $photoPath;
                }

                // Ensure new fields are included (convert empty strings to null)
                $personalInfoData['partiyaviyligi'] = !empty($personalInfoData['partiyaviyligi'] ?? null)
                    ? $personalInfoData['partiyaviyligi']
                    : null;
                $personalInfoData['xalq_deputatlari'] = !empty($personalInfoData['xalq_deputatlari'] ?? null)
                    ? $personalInfoData['xalq_deputatlari']
                    : null;
                // Remove fields that don't exist in personal_information table
                unset($personalInfoData['malumoti']);
                unset($personalInfoData['malumoti_boyicha_mutaxassisligi']);
                unset($personalInfoData['qaysi_chet_tillarini_biladi']);

                $personalInfo->update($personalInfoData);
            }

            // Update education records
            if ($request->has('education_records')) {
                $document->educationRecords()->delete();
                foreach ($request->education_records as $index => $educationRecord) {
                    EducationRecord::create([
                        'document_id' => $document->id,
                        'malumoti' => $educationRecord['malumoti'] ?? null,
                        'tamomlagan' => $educationRecord['tamomlagan'] ?? null,
                        'mutaxassisligi' => $educationRecord['mutaxassisligi'] ?? null,
                        'ilmiy_daraja' => $educationRecord['ilmiy_daraja'] ?? null,
                        'ilmiy_unvoni' => $educationRecord['ilmiy_unvoni'] ?? null,
                        'chet_tillari' => $educationRecord['chet_tillari'] ?? null,
                        'maxsus_unvoni' => $educationRecord['maxsus_unvoni'] ?? null,
                        'davlat_mukofoti' => $educationRecord['davlat_mukofoti'] ?? null,
                        'order_index' => $index,
                    ]);
                }
            }

            // Update relatives
            if ($request->has('relatives')) {
                $document->relatives()->delete();
                foreach ($request->relatives as $index => $relative) {
                    $vafotEtgan = $relative['vafot_etgan'] ?? false;
                    Relative::create([
                        'document_id' => $document->id,
                        'qarindoshligi' => $relative['qarindoshligi'],
                        'fio' => $relative['fio'],
                        'tugilgan' => $relative['tugilgan'],
                        'vafot_etgan' => $vafotEtgan,
                        'ish_joyi' => $vafotEtgan ? null : ($relative['ish_joyi'] ?? null),
                        'turar_joyi' => $vafotEtgan ? null : ($relative['turar_joyi'] ?? null),
                        'vafot_etgan_yili' => $vafotEtgan ? ($relative['vafot_etgan_yili'] ?? null) : null,
                        'kasbi' => $vafotEtgan ? ($relative['kasbi'] ?? null) : null,
                        'order_index' => $index,
                    ]);
                }
            }

            // Update work experiences
            if ($request->has('work_experiences')) {
                $document->workExperiences()->delete();
                foreach ($request->work_experiences as $index => $workExperience) {
                    WorkExperience::create([
                        'document_id' => $document->id,
                        'start_date' => $workExperience['start_date'],
                        'end_date' => !empty($workExperience['end_date'] ?? null) ? $workExperience['end_date'] : null,
                        'info' => $workExperience['info'],
                        'order_index' => $index,
                    ]);
                }
            }

            // If status is being set to 'completed', verify all required data is present
            if ($request->has('status') && $request->status === 'completed') {
                // Check if all required data is present
                if (!$document->personalInformation || !$document->educationRecords || !$document->relatives || !$document->workExperiences) {
                    return response()->json([
                        'success' => false,
                        'message' => 'All required data is not present',
                    ], 422);
                }
            }

            DB::commit();

            $document->load(['personalInformation', 'educationRecords', 'relatives', 'workExperiences']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $document = Document::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Download document as PDF.
     */
    public function download(Request $request, string $id)
    {
        $user = $request->user();
        $document = Document::with(['personalInformation', 'educationRecords', 'relatives', 'workExperiences'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        try {
            // Update status to 'completed' when PDF is downloaded
            if ($document->status === 'draft') {
                $document->update(['status' => 'completed']);
            }

            // Get document data
            $pi = $document->personalInformation;
            $educationRecords = $document->educationRecords;
            $relatives = $document->relatives;
            $workExperiences = $document->workExperiences;

            // Get document type label
            $documentTypeLabels = [
                'obyektivka' => 'Obyektivka',
                'ishga_olish_ariza' => "Ishga olish bo'yicha ariza",
                'kochirish_ariza' => "Ko'chirish bo'yicha ariza",
            ];
            $documentTypeLabel = $documentTypeLabels[$document->document_type] ?? $document->document_type;

            // Build HTML content
            $html = '<html><head><meta charset="UTF-8"></head><body>';
            $html .= '<style>
            body { 
                font-family: "Times New Roman", Times, serif; 
                font-size: 12px; 
                line-height: 1.4;
                max-width: 750px;
                margin: 0 auto;
                padding: 15px;
            }
            h1 { 
                text-align: center; 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 5px; 
                margin-top: 0; 
            }
            h2 { 
                text-align: center; 
                font-size: 14px; 
                font-weight: bold; 
                margin-top: 20px; 
                margin-bottom: 6px; 
            }
            .name-title { 
                text-align: center; 
                font-size: 13px; 
                font-weight: bold;
                margin-bottom: 10px; 
            }
            .current-position {
                text-align: left;
                font-size: 12px;
                margin-bottom: 6px;
                padding-right: 140px;
            }
            .photo-container { 
                position: absolute;
                top: 60px;
                right: 20px;
                width: 100px;
                height: 133px;
            }
            .photo-container img { 
                width: 100px; 
                height: 133px; 
                border: 1px solid #000; 
            }
            .info-section {
                margin-top: 15px;
                padding-right: 120px;
            }
            .info-label { 
                font-size: 12px;
                font-weight: bold;
                display: block;
            }
            .info-value {
                font-size: 11px;
                display: block;
            }
            .two-column {
                width: 100%;
                margin-top: 8px;
                margin-bottom: 8px;
            }
            .two-column td {
                width: 50%;
                vertical-align: top;
                padding-right: 10px;
            }
            table.relatives-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px; 
                font-size: 11px; 
            }
            table.relatives-table th, 
            table.relatives-table td { 
                border: 1px solid #000; 
                padding: 6px; 
                text-align: center; 
                vertical-align: middle; 
            }
            table.relatives-table th { 
                font-weight: bold; 
            }
            .section-title { 
                text-align: center; 
                font-weight: bold; 
                font-size: 14px; 
                margin-top: 25px; 
                margin-bottom: 15px; 
            }
            .page-break {
                page-break-before: always !important;
                break-before: page !important;
                page-break-inside: avoid !important;
            }
            .work-history {
                margin-top: 15px;
                padding-left: 20px;
                padding-right: 20px;
                line-height: 1.6;
            }
        </style>';

            // === FIRST PAGE ===

            // Title
            $html .= '<h1>МАЪЛУМОТНОМА</h1>';

            // Full Name Title
            $fullName = $pi ? trim($pi->familya . ' ' . $pi->ism . ' ' . $pi->sharif) : '';
            $html .= '<div class="name-title">' . htmlspecialchars($fullName) . '</div>';

            // Current Position (optional - based on document data)
            // Eng so'nggi ishni topish (hozirgi vaqtda ishlayotgan yoki eng so'nggi order_index)
            if ($document->document_type === 'obyektivka' && $pi && $workExperiences && count($workExperiences) > 0) {
                $currentWork = null;

                // Avval end_date null bo'lgan ishni qidiramiz (hozirgi vaqtda ishlayotgan)
                // Agar bir nechta bo'lsa, eng so'nggi order_index ga ega bo'lganini olamiz
                foreach ($workExperiences as $workExp) {
                    if ($workExp->end_date === null) {
                        if ($currentWork === null || $workExp->order_index > $currentWork->order_index) {
                            $currentWork = $workExp;
                        }
                    }
                }

                // Agar hozirgi vaqtda ishlayotgan ish topilmasa, eng so'nggi order_index ga ega bo'lgan ishni olamiz
                if ($currentWork === null) {
                    $currentWork = $workExperiences[count($workExperiences) - 1];
                }

                if ($currentWork) {
                    $currentDate = date('Y', strtotime($currentWork->start_date)) . ' йил ' . date('d', strtotime($currentWork->start_date)) . ' ' . $this->getMonthName(date('n', strtotime($currentWork->start_date))) . 'дан:';
                    $html .= '<div class="current-position">';
                    $html .= $currentDate . '<br>';
                    $html .= '<strong>' . htmlspecialchars($currentWork->info) . '</strong>';
                    $html .= '</div>';
                }
            }

            // Photo
            if ($pi && $pi->photo_path) {
                $photoPath = storage_path('app/public/' . $pi->photo_path);
                if (file_exists($photoPath)) {
                    $imageData = file_get_contents($photoPath);
                    $image = imagecreatefromstring($imageData);

                    if ($image !== false) {
                        $newWidth = 100;
                        $newHeight = 133;
                        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

                        imagecopyresampled(
                            $resizedImage,
                            $image,
                            0, 0, 0, 0,
                            $newWidth, $newHeight,
                            imagesx($image),
                            imagesy($image)
                        );

                        ob_start();
                        imagejpeg($resizedImage, null, 90);
                        $resizedImageData = ob_get_clean();
                        $base64Image = base64_encode($resizedImageData);

                        imagedestroy($image);
                        imagedestroy($resizedImage);

                        $html .= '<div class="photo-container"><img src="data:image/jpeg;base64,' . $base64Image . '" /></div>';
                    }
                }
            }

            // Personal Information Section
            if ($pi) {
                $html .= '<div class="info-section">';

                // Two-column layout for birth info
                $html .= '<table class="two-column" style="border: none;"><tr>';
                $html .= '<td style="border: none;">';
                $html .= '<div class="info-row">';
                $html .= '<div class="info-label">Туғилган йили:</div>';
                $html .= '<div class="info-value">' . date('d.m.Y', strtotime($pi->tugilgan_sana)) . '</div>';
                $html .= '</div>';
                $html .= '</td>';
                $html .= '<td style="border: none;">';
                $html .= '<div class="info-row">';
                $html .= '<div class="info-label">Туғилган жойи:</div>';
                $html .= '<div class="info-value">' . htmlspecialchars($pi->tugilgan_joyi) . '</div>';
                $html .= '</div>';
                $html .= '</td>';
                $html .= '</tr></table>';

                // Two-column layout for nationality and party
                $html .= '<table class="two-column" style="border: none;"><tr>';
                $html .= '<td style="border: none;">';
                $html .= '<div class="info-row">';
                $html .= '<div class="info-label">Миллати:</div>';
                $html .= '<div class="info-value">' . htmlspecialchars($pi->millati) . '</div>';
                $html .= '</div>';
                $html .= '</td>';
                $html .= '<td style="border: none;">';
                $html .= '<div class="info-row">';
                $html .= '<div class="info-label">Партиявийлиги:</div>';
                $html .= '<div class="info-value">' . ($pi->partiyaviyligi ? htmlspecialchars($pi->partiyaviyligi) : 'йўқ') . '</div>';
                $html .= '</div>';
                $html .= '</td>';
                $html .= '</tr></table>';

                // Education information from education_records
                if ($educationRecords && count($educationRecords) > 0) {
                    $firstEdu = $educationRecords[0];

                    // Two-column layout for education
                    $html .= '<table class="two-column" style="border: none;"><tr>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Маълумоти:</div>';
                    $html .= '<div class="info-value">' . htmlspecialchars($firstEdu->malumoti) . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Тамомлаган:</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->tamomlagan ? htmlspecialchars($firstEdu->tamomlagan) : '-') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '</tr></table>';

                    // Specialty
                    $html .= '<table class="two-column" style="border: none;"><tr>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Маълумоти бўйича мутахассислиги:</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->mutaxassisligi ? htmlspecialchars($firstEdu->mutaxassisligi) : '-') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '</tr></table>';

                    // Scientific degree and title
                    $html .= '<table class="two-column" style="border: none;"><tr>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Илмий даражаси:</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->ilmiy_daraja ? htmlspecialchars($firstEdu->ilmiy_daraja) : 'йўқ') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Илмий унвони:</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->ilmiy_unvoni ? htmlspecialchars($firstEdu->ilmiy_unvoni) : 'йўқ') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '</tr></table>';

                    // Languages and military rank
                    $html .= '<table class="two-column" style="border: none;"><tr>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Қайси чет тилларини билади:</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->chet_tillari ? htmlspecialchars($firstEdu->chet_tillari) : '-') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Ҳарбий (махсус) унвони:</div>';
                    $html .= '<div class="info-value"> ' . ($firstEdu->maxsus_unvoni ? htmlspecialchars($firstEdu->maxsus_unvoni) : 'йўқ') . '</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '</tr></table>';

                    // State awards
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Давлат мукофотлари билан тақдирланганми (қанақа):</div>';
                    $html .= '<div class="info-value">' . ($firstEdu->davlat_mukofoti ? htmlspecialchars($firstEdu->davlat_mukofoti) : 'йўқ') . '</div>';
                    $html .= '</div>';
                } else {
                    // Fallback if no education records
                    $html .= '<table class="two-column" style="border: none;"><tr>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Маълумоти:</div>';
                    $html .= '<div class="info-value">-</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '<td style="border: none;">';
                    $html .= '<div class="info-row">';
                    $html .= '<div class="info-label">Тамомлаган:</div>';
                    $html .= '<div class="info-value">-</div>';
                    $html .= '</div>';
                    $html .= '</td>';
                    $html .= '</tr></table>';
                }

                // Deputy status
                $html .= '<div class="info-row">';
                $html .= '<div class="info-label">Халқ депутатлари, республика, вилоят, шаҳар ва туман Кенгаши депутатими ёки бошқа сайланадиган органларнинг аъзосими (тўлиқ кўрсатилиши лозим):</div>';
                $html .= '<div class="info-value">' . ($pi->xalq_deputatlari ? htmlspecialchars($pi->xalq_deputatlari) : 'йўқ') . '</div>';
                $html .= '</div>';

                $html .= '</div>';  // end info-section
            }

            // Work History Section
            $html .= '<div class="section-title">МЕҲНАТ ФАОЛИЯТИ</div>';
            $html .= '<div class="work-history">';

            if ($workExperiences && count($workExperiences) > 0) {
                foreach ($workExperiences as $workExp) {
                    $startYear = date('Y', strtotime($workExp->start_date));

                    if ($workExp->end_date) {
                        $endYear = date('Y', strtotime($workExp->end_date));
                        $dateRange = $startYear . '-' . $endYear . ' йй.';
                    } else {
                        $dateRange = $startYear . ' й. ҳ.в.';
                    }

                    $html .= '<div style="margin-bottom: 8px; line-height: 1.6;">';
                    $html .= '<p>' . htmlspecialchars($dateRange) . ' - ' . htmlspecialchars($workExp->info) . '</p>';
                    $html .= '</div>';
                }
            } else {
                $html .= '<div style="margin-bottom: 8px;">Мавжуд эмас</div>';
            }

            $html .= '</div>';

            // === SECOND PAGE (Relatives) ===
            if ($relatives && count($relatives) > 0) {
                $html .= '<div class="page-break">';
                $html .= '<div class="name-title" style="margin-top: 20px;">' . htmlspecialchars($fullName) . ' яқин қариндошлари хақида</div>';
                $html .= '<h2>МАЪЛУМОТ</h2>';

                $html .= '<table class="relatives-table">';
                $html .= '<thead><tr>';
                $html .= '<th style="width: 12%;">Қарин-дошлиги</th>';
                $html .= '<th style="width: 22%;">Фамилияси, исми ва отасининг исми</th>';
                $html .= '<th style="width: 18%;">Туғилган йили ва жойи</th>';
                $html .= '<th style="width: 25%;">Иш жойи ва лавозими</th>';
                $html .= '<th style="width: 23%;">Турар жойи</th>';
                $html .= '</tr></thead><tbody>';

                foreach ($relatives as $relative) {
                    $html .= '<tr>';
                    $html .= '<td>' . htmlspecialchars($relative->qarindoshligi) . '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->fio) . '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->tugilgan);
                    if ($relative->vafot_etgan) {
                        $html .= '<br>(вафот этган';
                        if ($relative->vafot_etgan_yili) {
                            $html .= ', ' . htmlspecialchars($relative->vafot_etgan_yili) . ' йил';
                        }
                        $html .= ')';
                    }
                    $html .= '</td>';
                    if ($relative->vafot_etgan) {
                        $html .= '<td>' . ($relative->kasbi ? htmlspecialchars($relative->kasbi) : '-') . '</td>';
                        $html .= '<td>-</td>';
                    } else {
                        $html .= '<td>' . ($relative->ish_joyi ? htmlspecialchars($relative->ish_joyi) : '-') . '</td>';
                        $html .= '<td>' . ($relative->turar_joyi ? htmlspecialchars($relative->turar_joyi) : '-') . '</td>';
                    }
                    $html .= '</tr>';
                }

                $html .= '</tbody></table>';
                $html .= '</div>';  // Close page-break div
            }

            $html .= '</body></html>';

            // Generate filename
            $filename = 'Malumоtnoma_' . ($pi ? $pi->familya . '_' . $pi->ism : 'document') . '_' . date('Y-m-d') . '.pdf';
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

            // Generate PDF using Browsershot
            // Set node_modules path so Browsershot can find puppeteer
            $nodeModulesPath = base_path('node_modules');
            $nodeBinary = trim(shell_exec('which node') ?: '/usr/bin/node');
            $npmBinary = trim(shell_exec('which npm') ?: '/usr/bin/npm');

            // Set NODE_PATH in environment
            putenv('NODE_PATH=' . $nodeModulesPath);

            $pdfContent = Browsershot::html($html)
                ->setNodeModulePath($nodeModulesPath)
                ->setNodeBinary($nodeBinary)
                ->setNpmBinary($npmBinary)
                ->setIncludePath(getenv('PATH') . ':' . dirname($nodeBinary))
                ->paperSize(210, 297, 'mm')  // A4 size
                ->margins(15, 15, 20, 20, 'mm')  // top, right, bottom, left
                ->showBackground()
                ->setOption('preferCSSPageSize', true)  // CSS page-break ni qo'llab-quvvatlash
                ->pdf();

            // Output PDF
            return response($pdfContent, 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Helper method for month names in Uzbek
    private function getMonthName($month)
    {
        $months = [
            1 => 'январ',
            2 => 'феврал',
            3 => 'март',
            4 => 'апрел',
            5 => 'май',
            6 => 'июн',
            7 => 'июл',
            8 => 'август',
            9 => 'сентябр',
            10 => 'октябр',
            11 => 'ноябр',
            12 => 'декабр',
        ];
        return $months[$month] ?? '';
    }
}
