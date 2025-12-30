<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class PersonalInformation extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'familya',
        'ism',
        'sharif',
        'photo_path',
        'tugilgan_sana',
        'tugilgan_joyi',
        'millati',
        'partiyaviyligi',
        'xalq_deputatlari',
    ];

    protected $casts = [
        'tugilgan_sana' => 'date',
    ];

    /**
     * Get the document that owns the personal information.
     * @return Illuminate\Database\Eloquent\Relations\BelongsTo;
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
