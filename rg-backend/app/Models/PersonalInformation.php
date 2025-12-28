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
        'joriy_lavozim_sanasi',
        'joriy_lavozim_toliq',
        'tugilgan_sana',
        'tugilgan_joyi',
        'millati',
        'partiyaviyligi',
        'malumoti',
        'malumoti_boyicha_mutaxassisligi',
        'qaysi_chet_tillarini_biladi',
        'xalq_deputatlari',
    ];

    protected $casts = [
        'tugilgan_sana' => 'date',
        'malumoti' => 'string',
    ];

    /**
     * Get the document that owns the personal information.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
