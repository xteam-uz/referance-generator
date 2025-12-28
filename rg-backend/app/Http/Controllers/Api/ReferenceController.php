<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReferenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $references = Reference::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $references,
            'message' => 'References retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'year' => 'required|integer|min:1000|max:' . (date('Y') + 10),
            'type' => 'required|in:book,article,website,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $reference = Reference::create([
            ...$validator->validated(),
            'user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $reference,
            'message' => 'Reference created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $reference = Reference::find($id);

        if (!$reference) {
            return response()->json([
                'success' => false,
                'message' => 'Reference not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $reference,
            'message' => 'Reference retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $reference = Reference::find($id);

        if (!$reference) {
            return response()->json([
                'success' => false,
                'message' => 'Reference not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:1000|max:' . (date('Y') + 10),
            'type' => 'sometimes|in:book,article,website,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reference->update($validator->validated());

        return response()->json([
            'success' => true,
            'data' => $reference->fresh(),
            'message' => 'Reference updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $reference = Reference::find($id);

        if (!$reference) {
            return response()->json([
                'success' => false,
                'message' => 'Reference not found',
            ], 404);
        }

        $reference->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reference deleted successfully',
        ]);
    }
}
