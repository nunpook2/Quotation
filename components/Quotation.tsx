import React, { useState, useEffect, useRef } from 'react';
import { QuotationItem, CustomerInfo, DocInfo } from '../types';
import { thaiBahtText } from '../utils/thaiBaht';
import { Plus, Trash2, Printer, Upload, Image as ImageIcon, Download, FileJson, FolderOpen } from 'lucide-react';

const Logo = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L10 90 L35 90 L50 60 L65 90 L90 90 L50 10 Z" fill="#0070c0" />
    <path d="M25 90 L50 40 L75 90" stroke="white" strokeWidth="2" fill="none" />
    <path d="M40 90 L50 70 L60 90" fill="#005a9e" />
  </svg>
);

// Helper component to auto-resize textarea based on content
const AutoResizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to allow shrinking
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight to fit content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [props.value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={`${className} overflow-hidden`}
      rows={1}
    />
  );
};

export const Quotation: React.FC = () => {
  // --- State ---
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'คุณสุเทพ',
    company: 'SEWS-COMPONENTS.,Ltd.',
    address: '7/129หมู่4ตำบลมาบยางพร อำเภอปลวกแดง จังหวัดระยอง 21140',
    phone: '0-955-576665',
    taxId: ''
  });

  const [docInfo, setDocInfo] = useState<DocInfo>({
    no: 'QT6301-002',
    date: '4/10/2025',
    paymentTerms: '',
    credit: 'เครดิต'
  });

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      description: 'ชั้นวางชิ้นงาน พร้อมทำสี (Modify)\nเพิ่มแผ่นเหล็กหนา 2 mm ตามแบบ',
      qty: 1,
      unit: 'ชุด',
      pricePerUnit: 2800.00,
      image: 'https://picsum.photos/200/150' // Placeholder as per instructions, user can replace
    }
  ]);

  const [enableVat, setEnableVat] = useState(true);

  // --- Calculations ---
  const subTotal = items.reduce((sum, item) => sum + (item.qty * item.pricePerUnit), 0);
  const vatAmount = enableVat ? subTotal * 0.07 : 0;
  const grandTotal = subTotal + vatAmount;

  // --- Handlers ---
  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        qty: 0,
        unit: 'หน่วย',
        pricePerUnit: 0
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleItemChange(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Save / Load Data ---
  const handleSaveData = () => {
    const data = {
      customer,
      docInfo,
      items,
      enableVat
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation_${docInfo.no}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadDataClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.customer && json.docInfo && json.items) {
          setCustomer(json.customer);
          setDocInfo(json.docInfo);
          setItems(json.items);
          if (json.enableVat !== undefined) setEnableVat(json.enableVat);
          alert("โหลดข้อมูลสำเร็จ");
        } else {
          alert("รูปแบบไฟล์ไม่ถูกต้อง");
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = ''; 
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center font-sans text-sm text-black">
      
      {/* Action Bar */}
      <div className="w-full max-w-[210mm] mb-4 flex flex-wrap justify-end gap-2 no-print">
         <div className="flex gap-2 mr-auto">
             <button 
              onClick={handleSaveData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
              title="บันทึกข้อมูลเป็นไฟล์สำหรับส่งต่อ"
            >
              <Download size={16} /> บันทึกไฟล์ข้อมูล
            </button>
            <button 
              onClick={handleLoadDataClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              title="เปิดไฟล์ข้อมูลที่บันทึกไว้"
            >
              <FolderOpen size={16} /> เปิดไฟล์ข้อมูล
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
         </div>

        <button 
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <Plus size={16} /> เพิ่มรายการ
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Printer size={16} /> พิมพ์ / PDF
        </button>
      </div>

      {/* A4 Paper Container */}
      {/* UPDATE: Removed print:p-0 and print:w-full to keep original padding and width in print mode */}
      <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-[15mm] relative box-border mx-auto print:shadow-none print:w-[210mm] print:p-[15mm] print:m-0 print:overflow-visible">
        
        {/* Header Section */}
        <div className="flex gap-4 mb-6">
          <div className="w-24 pt-2">
             <Logo />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">บริษัท อภิภู 951 เซอร์วิส แอนด์ ซัพพลาย จำกัด</h1>
            <p className="text-sm text-gray-700">124/43 หมู่ที่ 4 ตำบลบ้านฉาง อำเภอบ้านฉาง จังหวัดระยอง 21130</p>
            <p className="text-sm text-gray-700">โทร : 0845653994 <span className="ml-4">อีเมล์ : message_limit@hotmail.com</span></p>
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-700">เลขประจำตัวผู้เสียภาษีอากร 0215565004045</p>
                <p className="text-sm text-gray-700 text-right">(สำนักงานใหญ่)</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4 relative">
          <h2 className="text-xl font-bold border-2 border-black inline-block px-8 py-1">ใบเสนอราคา/Quotation</h2>
        </div>

        {/* Customer & Document Info */}
        <div className="border-2 border-black mb-0 text-sm">
          <div className="flex">
            {/* Left Column: Customer */}
            <div className="w-[60%] border-r border-black p-2 space-y-1">
              <div className="flex">
                <span className="w-24 font-bold flex-shrink-0">ชื่อลูกค้า</span>
                <input 
                  type="text" 
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  className="w-full bg-transparent focus:outline-none border-b border-dotted border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex">
                <span className="w-24 font-bold flex-shrink-0">บริษัท</span>
                <input 
                  type="text" 
                  value={customer.company}
                  onChange={e => setCustomer({...customer, company: e.target.value})}
                  className="w-full bg-transparent focus:outline-none border-b border-dotted border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex items-start">
                <span className="w-24 font-bold flex-shrink-0">ที่อยู่</span>
                <AutoResizeTextarea 
                  value={customer.address}
                  onChange={e => setCustomer({...customer, address: e.target.value})}
                  className="w-full bg-transparent focus:outline-none resize-none border-b border-dotted border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex">
                <span className="w-24 font-bold flex-shrink-0">เบอร์โทรศัพท์</span>
                <input 
                  type="text" 
                  value={customer.phone}
                  onChange={e => setCustomer({...customer, phone: e.target.value})}
                  className="w-full bg-transparent focus:outline-none border-b border-dotted border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex">
                <span className="w-40 font-bold flex-shrink-0">เลขประจำตัวผู้เสียภาษีอากร</span>
                <input 
                  type="text" 
                  value={customer.taxId}
                  onChange={e => setCustomer({...customer, taxId: e.target.value})}
                  className="w-full bg-transparent focus:outline-none border-b border-dotted border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column: Doc Info */}
            <div className="w-[40%] p-2 space-y-1">
              <div className="flex items-center">
                <span className="w-32 font-bold flex-shrink-0">เลขที่ใบเสนอราคา</span>
                <input 
                  type="text" 
                  value={docInfo.no}
                  onChange={e => setDocInfo({...docInfo, no: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-right"
                />
              </div>
              <div className="flex items-center">
                <span className="w-32 font-bold flex-shrink-0">วันที่</span>
                <input 
                  type="text" 
                  value={docInfo.date}
                  onChange={e => setDocInfo({...docInfo, date: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-right"
                />
              </div>
              <div className="flex items-center">
                <span className="w-32 font-bold flex-shrink-0">เงื่อนไขการชำระเงิน</span>
                <input 
                  type="text" 
                  value={docInfo.paymentTerms}
                  onChange={e => setDocInfo({...docInfo, paymentTerms: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-right"
                />
              </div>
              <div className="flex items-center">
                <span className="w-32 font-bold flex-shrink-0">เครดิต</span>
                <input 
                  type="text" 
                  value={docInfo.credit}
                  onChange={e => setDocInfo({...docInfo, credit: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border-l-2 border-r-2 border-b-2 border-black mb-0">
          <thead>
            <tr className="h-10 text-center font-bold border-b border-black">
              <th className="border-r border-black w-12">ลำดับ</th>
              <th className="border-r border-black">รายละเอียด</th>
              <th className="border-r border-black w-20">จำนวน</th>
              <th className="border-r border-black w-20">หน่วย</th>
              <th className="border-r border-black w-28">ราคา/หน่วย</th>
              <th className="w-28">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="align-top group">
                <td className="border-r border-black text-center py-2 relative">
                  {index + 1}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-1 left-1 text-red-500 opacity-0 group-hover:opacity-100 no-print"
                    title="ลบรายการ"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
                <td className="border-r border-black py-2 px-2">
                  <AutoResizeTextarea 
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full bg-transparent resize-none focus:outline-none min-h-[1.5em]"
                  />
                  
                  {/* Image Area */}
                  <div className="mt-2">
                    {item.image && (
                      <div className="relative inline-block border border-gray-300 p-1 mb-2">
                         <img src={item.image} alt="Product" className="max-h-[150px] object-contain" />
                         <button 
                            onClick={() => handleItemChange(item.id, 'image', null)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 no-print"
                         >
                           <Trash2 size={10} />
                         </button>
                      </div>
                    )}
                    <div className="no-print mt-1">
                      <label className="cursor-pointer text-xs text-blue-600 flex items-center gap-1 hover:underline">
                        <Upload size={12} />
                        {item.image ? 'เปลี่ยนรูปภาพ' : 'เพิ่มรูปภาพ'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(item.id, e)}
                        />
                      </label>
                    </div>
                  </div>
                </td>
                <td className="border-r border-black text-center py-2">
                   <input 
                    type="number"
                    value={item.qty === 0 ? '' : item.qty}
                    onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))}
                    className="w-full text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                   />
                </td>
                <td className="border-r border-black text-center py-2">
                  <input 
                    type="text"
                    value={item.unit}
                    onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                    className="w-full text-center bg-transparent focus:outline-none"
                   />
                </td>
                <td className="border-r border-black text-center py-2 px-2">
                   <input 
                    type="number"
                    value={item.pricePerUnit === 0 ? '' : item.pricePerUnit}
                    onChange={e => handleItemChange(item.id, 'pricePerUnit', Number(e.target.value))}
                    className="w-full text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                   />
                </td>
                <td className="text-right py-2 px-2">
                  {(item.qty * item.pricePerUnit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
              </tr>
            ))}
            
            {/* Add Item Row - Visible in Edit, Hidden in Print */}
            <tr className="no-print">
               <td colSpan={6} className="text-center py-2 border-r border-l border-black bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={addItem}>
                 <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                   <Plus size={16} /> คลิกเพื่อเพิ่มรายการใหม่ (รายการที่ {items.length + 1})
                 </div>
               </td>
            </tr>

            {/* Filler rows - Only show if we have few items to maintain paper look */}
            {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
              <tr key={`filler-${i}`} className="h-12 border-b-0">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Totals */}
        <div className="border-2 border-t-0 border-black flex">
          
          {/* Thai Text & Note */}
          <div className="flex-1 border-r border-black flex flex-col justify-end">
             <div className="p-2 flex items-center h-10 border-b border-black">
                <span className="font-bold mr-4 w-16">ตัวอักษร(</span>
                <span className="flex-1 text-center">{thaiBahtText(grandTotal)}</span>
                <span>)</span>
             </div>
          </div>

          {/* Numbers */}
          <div className="w-[85mm]">
            <div className="flex border-b border-black">
               <div className="flex-1 p-1 text-center font-bold text-sm">รวมเงิน</div>
               <div className="w-28 p-1 text-right font-bold border-l border-black">
                  {subTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </div>
            </div>
            <div className="flex border-b border-black">
               <div className="flex-1 p-1 text-center font-bold text-sm">ส่วนลด</div>
               <div className="w-28 p-1 text-right border-l border-black bg-gray-100 print:bg-transparent">
                  {/* Discount Placeholder - can be made editable if needed */}
                  
               </div>
            </div>
            <div className="flex border-b border-black">
               <div className="flex-1 p-1 text-center font-bold text-sm relative">
                  ภาษีมูลค่าเพิ่ม 7%
                  <input 
                    type="checkbox" 
                    checked={enableVat}
                    onChange={(e) => setEnableVat(e.target.checked)}
                    className="absolute left-2 top-1.5 opacity-50 hover:opacity-100 cursor-pointer no-print"
                    title="คิดภาษีมูลค่าเพิ่ม"
                  />
               </div>
               <div className="w-28 p-1 text-right font-bold border-l border-black">
                  {vatAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </div>
            </div>
             <div className="flex">
               <div className="flex-1 p-1 text-center font-bold text-sm">รวมราคาทั้งสิ้น</div>
               <div className="w-28 p-1 text-right font-bold border-l border-black">
                  {grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-4 text-xs font-bold flex gap-2">
            <span>หมายเหตุ</span>
            <input 
              defaultValue="กรณีต้องการซื้อสินค้าหรือใช้บริการดังกล่าวข้างต้น กรุณาลงชื่อด้านล่าง พร้อมประทับตราบริษัทและส่งกลับมา"
              className="flex-1 bg-transparent focus:outline-none"
            />
        </div>

        {/* Signature Area */}
        <div className="mt-16 text-xs pl-2">
          ขอขอบพระคุณที่ท่านให้ความสนใจในบริการของเรา
        </div>

      </div>
      
      <div className="mt-8 text-gray-500 text-sm no-print">
         * แก้ไขข้อมูลโดยคลิกที่ข้อความ | เพิ่มรายการกดปุ่มสีเขียวในตาราง | พิมพ์กดปุ่มสีฟ้าด้านบน | <strong>บันทึก/โหลดไฟล์เพื่อส่งต่อ</strong>
      </div>
    </div>
  );
};