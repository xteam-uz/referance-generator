<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class EducationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'malumoti',
        'tamomlagan',
        'mutaxassisligi',
        'ilmiy_daraja',
        'ilmiy_unvoni',
        'chet_tillari',
        'maxsus_unvoni',
        'davlat_mukofoti',
        'order_index',
    ];

    protected $casts = [
        'order_index' => 'integer',
    ];

    /**
     * Get the document that owns the education record.
     * @return Illuminate\Database\Eloquent\Relations\BelongsTo;
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
