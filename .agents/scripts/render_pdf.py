import fitz
doc = fitz.open("attached_assets/Brochure_Clientum_2026_Distribuidora_del_Sur_S_A____Neuqu_n_(5_1783681433945.pdf")
print("pages:", doc.page_count)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2,2))
    pix.save(f".agents/outputs/brochure_page_{i+1}.png")
