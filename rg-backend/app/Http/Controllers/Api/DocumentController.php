<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\EducationRecord;
use App\Models\PersonalInformation;
use App\Models\Relative;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Mpdf\Mpdf;

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
        $validator = Validator::make($request->all(), [
            'document_type' => 'required|in:obyektivka,ishga_olish_ariza,kochirish_ariza',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png|max:1024',
            'personal_information' => 'required|array',
            'personal_information.familya' => 'required|string|max:255',
            'personal_information.ism' => 'required|string|max:255',
            'personal_information.sharif' => 'required|string|max:255',
            'personal_information.joriy_lavozim_sanasi' => 'required|string|max:255',
            'personal_information.joriy_lavozim_toliq' => 'required|string|max:500',
            'personal_information.tugilgan_sana' => 'required|date',
            'personal_information.tugilgan_joyi' => 'required|string|max:255',
            'personal_information.millati' => 'required|string|max:255',
            'personal_information.partiyaviyligi' => 'nullable|string|max:255',
            'personal_information.malumoti' => "required|in:Oliy,O'rta maxsus,O'rta",
            'personal_information.malumoti_boyicha_mutaxassisligi' => 'nullable|string|max:255',
            'personal_information.qaysi_chet_tillarini_biladi' => 'nullable|string|max:255',
            'personal_information.xalq_deputatlari' => 'nullable|string',
            'education_records' => 'required|array',
            'education_records.*.description' => 'required|string',
            'relatives' => 'required|array',
            'relatives.*.qarindoshligi' => 'required|in:Otasi,Onasi,Akasi,Ukasi,Opasi',
            'relatives.*.fio' => 'required|string|max:255',
            'relatives.*.tugilgan' => 'required|string|max:255',
            'relatives.*.vafot_etgan' => 'boolean',
            'relatives.*.ish_joyi' => 'required|string|max:500',
            'relatives.*.turar_joyi' => 'required|string|max:255',
        ]);

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
                $photoPath = $photo->store('photos', 'public');
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
            $personalInfoData['malumoti_boyicha_mutaxassisligi'] = !empty($personalInfoData['malumoti_boyicha_mutaxassisligi'] ?? null)
                ? $personalInfoData['malumoti_boyicha_mutaxassisligi']
                : null;
            $personalInfoData['qaysi_chet_tillarini_biladi'] = !empty($personalInfoData['qaysi_chet_tillarini_biladi'] ?? null)
                ? $personalInfoData['qaysi_chet_tillarini_biladi']
                : null;
            $personalInfoData['xalq_deputatlari'] = !empty($personalInfoData['xalq_deputatlari'] ?? null)
                ? $personalInfoData['xalq_deputatlari']
                : null;
            PersonalInformation::create($personalInfoData);

            // Create education records
            foreach ($request->education_records as $index => $educationRecord) {
                EducationRecord::create([
                    'document_id' => $document->id,
                    'description' => $educationRecord['description'],
                    'order_index' => $index,
                ]);
            }

            // Create relatives
            foreach ($request->relatives as $index => $relative) {
                Relative::create([
                    'document_id' => $document->id,
                    'qarindoshligi' => $relative['qarindoshligi'],
                    'fio' => $relative['fio'],
                    'tugilgan' => $relative['tugilgan'],
                    'vafot_etgan' => $relative['vafot_etgan'] ?? false,
                    'ish_joyi' => $relative['ish_joyi'],
                    'turar_joyi' => $relative['turar_joyi'],
                    'order_index' => $index,
                ]);
            }

            DB::commit();

            $document->load(['personalInformation', 'educationRecords', 'relatives']);

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
        $document = Document::with(['personalInformation', 'educationRecords', 'relatives'])
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
            'photo' => 'nullable|image|mimes:jpeg,jpg,png|max:1024',
            'personal_information.joriy_lavozim_sanasi' => 'sometimes|string|max:255',
            'personal_information.joriy_lavozim_toliq' => 'sometimes|string|max:500',
            'personal_information.tugilgan_sana' => 'sometimes|date',
            'personal_information.tugilgan_joyi' => 'sometimes|string|max:255',
            'personal_information.millati' => 'sometimes|string|max:255',
            'personal_information.partiyaviyligi' => 'nullable|string|max:255',
            'personal_information.malumoti' => "sometimes|in:Oliy,O'rta maxsus,O'rta",
            'personal_information.malumoti_boyicha_mutaxassisligi' => 'nullable|string|max:255',
            'personal_information.qaysi_chet_tillarini_biladi' => 'nullable|string|max:255',
            'personal_information.xalq_deputatlari' => 'nullable|string',
            'education_records' => 'sometimes|array',
            'education_records.*.description' => 'sometimes|string',
            'relatives' => 'sometimes|array',
            'relatives.*.qarindoshligi' => 'sometimes|in:Otasi,Onasi,Akasi,Ukasi,Opasi',
            'relatives.*.fio' => 'sometimes|string|max:255',
            'relatives.*.tugilgan' => 'sometimes|string|max:255',
            'relatives.*.vafot_etgan' => 'boolean',
            'relatives.*.ish_joyi' => 'sometimes|string|max:500',
            'relatives.*.turar_joyi' => 'sometimes|string|max:255',
        ]);

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
                $personalInfoData['malumoti_boyicha_mutaxassisligi'] = !empty($personalInfoData['malumoti_boyicha_mutaxassisligi'] ?? null)
                    ? $personalInfoData['malumoti_boyicha_mutaxassisligi']
                    : null;
                $personalInfoData['qaysi_chet_tillarini_biladi'] = !empty($personalInfoData['qaysi_chet_tillarini_biladi'] ?? null)
                    ? $personalInfoData['qaysi_chet_tillarini_biladi']
                    : null;
                $personalInfoData['xalq_deputatlari'] = !empty($personalInfoData['xalq_deputatlari'] ?? null)
                    ? $personalInfoData['xalq_deputatlari']
                    : null;

                $personalInfo->update($personalInfoData);
            }

            // Update education records
            if ($request->has('education_records')) {
                $document->educationRecords()->delete();
                foreach ($request->education_records as $index => $educationRecord) {
                    EducationRecord::create([
                        'document_id' => $document->id,
                        'description' => $educationRecord['description'],
                        'order_index' => $index,
                    ]);
                }
            }

            // Update relatives
            if ($request->has('relatives')) {
                $document->relatives()->delete();
                foreach ($request->relatives as $index => $relative) {
                    Relative::create([
                        'document_id' => $document->id,
                        'qarindoshligi' => $relative['qarindoshligi'],
                        'fio' => $relative['fio'],
                        'tugilgan' => $relative['tugilgan'],
                        'vafot_etgan' => $relative['vafot_etgan'] ?? false,
                        'ish_joyi' => $relative['ish_joyi'],
                        'turar_joyi' => $relative['turar_joyi'],
                        'order_index' => $index,
                    ]);
                }
            }

            DB::commit();

            $document->load(['personalInformation', 'educationRecords', 'relatives']);

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
        $document = Document::with(['personalInformation', 'educationRecords', 'relatives'])
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
            // Configure mPDF
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'orientation' => 'P',
                'margin_left' => 15,
                'margin_right' => 15,
                'margin_top' => 20,
                'margin_bottom' => 20,
                'tempDir' => storage_path('app/temp'),
            ]);

            // Get document data
            $pi = $document->personalInformation;
            $educationRecords = $document->educationRecords;
            $relatives = $document->relatives;

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
            body { font-family: "Times New Roman", Times, serif; font-size: 11px; line-height: 1.3; }
            h1 { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 10px; margin-top: 0; }
            h2 { text-align: center; font-size: 12px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; }
            .subtitle { text-align: center; font-size: 11px; margin-bottom: 15px; }
            .content-wrapper { display: flex; }
            .info-row { margin-bottom: 4px; line-height: 1.3; }
            .info-label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            table th, table td { border: 1px solid #000; padding: 5px; text-align: left; vertical-align: top; }
            table th { font-weight: bold; text-align: center; }
            .photo-container { float: right; margin-left: 15px; margin-bottom: 5px; }
            .photo-container img { width: 85px; height: 113px; border: 1px solid #000; }
            .section { margin-top: 15px; }
            .clear { clear: both; }
        </style>';

            // Title
            $html .= "<h1>MA'LUMOTNOMA</h1>";

            // Subtitle
            $fullName = $pi ? trim($pi->familya . ' ' . $pi->ism . ' ' . $pi->sharif) : '';
            $html .= '<div class="subtitle">' . htmlspecialchars($fullName) . ' haqida</div>';

            $html .= '<div class="content-wrapper">';
            // Photo (3x4 cm = approximately 85x113 pixels at 72 DPI)
            if ($pi && $pi->photo_path) {
                $photoPath = storage_path('app/public/' . $pi->photo_path);
                if (file_exists($photoPath)) {
                    // Resize image to 3x4 cm (85x113 pixels)
                    $imageData = file_get_contents($photoPath);
                    $image = imagecreatefromstring($imageData);

                    if ($image !== false) {
                        // Create new image with fixed size
                        $newWidth = 85;
                        $newHeight = 113;
                        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

                        // Resize
                        imagecopyresampled(
                            $resizedImage,
                            $image,
                            0, 0, 0, 0,
                            $newWidth, $newHeight,
                            imagesx($image),
                            imagesy($image)
                        );

                        // Convert to base64
                        ob_start();
                        imagejpeg($resizedImage, null, 90);
                        $resizedImageData = ob_get_clean();
                        $base64Image = base64_encode($resizedImageData);

                        imagedestroy($image);
                        imagedestroy($resizedImage);

                        $html .= '<div class="photo-container"><img src="data:image/jpeg;base64,' . $base64Image . '" width="85" height="113" /></div>';
                    }
                }
            }
            // Personal Information
            if ($pi) {
                $html .= '<div class="info-row">' . htmlspecialchars($fullName) . '</div>';

                $html .= '<table style="border: none; width: 100%; margin-top: 8px;"><tr>';
                $html .= '<td style="border: none; width: 50%; padding: 0; vertical-align: top;">';
                $html .= '<div class="info-row"><span class="info-label">Tug\'ilgan yili:</span></div>';
                $html .= '<div class="info-row">' . date('d.m.Y', strtotime($pi->tugilgan_sana)) . '</div>';
                $html .= '<div class="info-row"><span class="info-label">Millati:</span></div>';
                $html .= '<div class="info-row">' . htmlspecialchars($pi->millati) . '</div>';
                $html .= '<div class="info-row"><span class="info-label">Ma\'lumoti:</span></div>';
                $html .= '<div class="info-row">' . htmlspecialchars($pi->malumoti) . '</div>';
                $html .= '</td>';

                $html .= '<td style="border: none; width: 50%; padding: 0; padding-left: 20px; vertical-align: top;">';
                $html .= '<div class="info-row"><span class="info-label">Tug\'ilgan joyi:</span></div>';
                $html .= '<div class="info-row">' . htmlspecialchars($pi->tugilgan_joyi) . '</div>';
                $html .= '<div class="info-row"><span class="info-label">Partiyaviyligi:</span></div>';
                $html .= '<div class="info-row">' . ($pi->partiyaviyligi ? htmlspecialchars($pi->partiyaviyligi) : '-') . '</div>';
                $html .= '<div class="info-row"><span class="info-label">Tamomlagan:</span></div>';
                if ($educationRecords && count($educationRecords) > 0) {
                    $eduList = [];
                    foreach ($educationRecords as $edu) {
                        $eduList[] = htmlspecialchars($edu->description);
                    }
                    $html .= '<div class="info-row">' . implode(', ', $eduList) . '</div>';
                } else {
                    $html .= '<div class="info-row">-</div>';
                }
                $html .= '</td>';
                $html .= '</tr></table>';

                $html .= '<div class="clear"></div>';

                $html .= '<div class="info-row" style="margin-top: 6px;"><span class="info-label">Ma\'lumoti bo\'yicha mutaxassisligi:</span></div>';
                $html .= '<div class="info-row">' . ($pi->malumoti_boyicha_mutaxassisligi ? htmlspecialchars($pi->malumoti_boyicha_mutaxassisligi) : '-') . '</div>';

                $html .= '<table style="border: none; width: 100%; margin-top: 6px;"><tr>';
                $html .= '<td style="border: none; width: 50%; padding: 0; vertical-align: top;">';
                $html .= '<div class="info-row"><span class="info-label">Ilmiy darajasi:</span></div>';
                $html .= '<div class="info-row">yo\'q</div>';
                $html .= '</td>';
                $html .= '<td style="border: none; width: 50%; padding: 0; padding-left: 20px; vertical-align: top;">';
                $html .= '<div class="info-row"><span class="info-label">Ilmiy unvoni:</span></div>';
                $html .= '<div class="info-row">yo\'q</div>';
                $html .= '</td>';
                $html .= '</tr></table>';

                $html .= '<div class="info-row" style="margin-top: 6px;"><span class="info-label">Qaysi chet tillarini biladi:</span></div>';
                $html .= '<div class="info-row">' . ($pi->qaysi_chet_tillarini_biladi ? htmlspecialchars($pi->qaysi_chet_tillarini_biladi) : '-') . '</div>';

                $html .= '<div class="info-row" style="margin-top: 6px;"><span class="info-label">Davlat mukofoti bilan taqdirlanganmi:</span></div>';
                $html .= '<div class="info-row">yo\'q</div>';

                $html .= '<div class="info-row" style="margin-top: 6px;"><span class="info-label">Xalq deputatlari respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a\'zosimi:</span></div>';
                $html .= '<div class="info-row">' . ($pi->xalq_deputatlari ? htmlspecialchars($pi->xalq_deputatlari) : '-') . '</div>';
            }
            $html .= '</div>';

            // Work Activity Section
            $html .= '<div class="section"><h2>MEHNAT FAOLIYATI</h2>';
            // $html .= '<div style="text-align: center;">-</div></div>';

            // Page break before relatives
            if ($relatives && count($relatives) > 0) {
                // $html .= '<pagebreak />';

                $html .= '<div style="margin-top: 20px;">';
                $html .= '<div class="subtitle">' . htmlspecialchars($fullName) . ' haqida</div>';
                $html .= "<h2>MA'LUMOT</h2>";
                $html .= '<table>';
                $html .= '<thead><tr>';
                $html .= '<th>Qarin doshligi</th>';
                $html .= '<th>Familyasi, ismi va otasining ismi</th>';
                $html .= "<th>Tug'ilgan yili va joyi</th>";
                $html .= '<th>Ish joyi va lavozimi</th>';
                $html .= '<th>Turar joyi</th>';
                $html .= '</tr></thead><tbody>';

                foreach ($relatives as $relative) {
                    $html .= '<tr>';
                    $html .= '<td>' . htmlspecialchars($relative->qarindoshligi) . '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->fio) . '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->tugilgan);
                    if ($relative->vafot_etgan) {
                        $html .= ' (vafot etgan)';
                    }
                    $html .= '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->ish_joyi) . '</td>';
                    $html .= '<td>' . htmlspecialchars($relative->turar_joyi) . '</td>';
                    $html .= '</tr>';
                }

                $html .= '</tbody></table></div>';
            }

            $html .= '</body></html>';

            // Write HTML to PDF
            $mpdf->WriteHTML($html);

            // Generate filename
            $filename = $documentTypeLabel . '_' . ($pi ? $pi->familya . '_' . $pi->ism : 'document') . '_' . date('Y-m-d') . '.pdf';
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

            // Get PDF content as string
            $pdfContent = $mpdf->Output($filename, 'S');

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
}
