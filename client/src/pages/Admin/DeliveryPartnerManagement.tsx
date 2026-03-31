import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Eye, EyeOff, Edit2, Lock, Unlock, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import ActionConfirmModal, { type ActionConfirmType } from '../../components/Admin/ActionConfirmModal';
import {
  getDeliveryPartners, addDeliveryPartner, updateDeliveryPartner,
  deleteDeliveryPartner, hardDeleteDeliveryPartner,
  type DeliveryPartner,
} from '../../services/Admin/deliveryPartnerService';
import axiosInstance from '../../services/axiosInstance';

const updateDeliveryPartnerForm = async (id: string, fd: FormData) => {
  const { data } = await axiosInstance.put(`admin/delivery-partners/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import PrimeLoader from '../../components/PrimeLoader';

const pwdRules = [
  { id:'length',    text:'At least 6 characters',  test:(v:string)=>v.length>=6 },
  { id:'noSpaces',  text:'No spaces',               test:(v:string)=>v.length>0&&!/\s/.test(v) },
  { id:'uppercase', text:'One uppercase letter',    test:(v:string)=>/[A-Z]/.test(v) },
  { id:'lowercase', text:'One lowercase letter',    test:(v:string)=>/[a-z]/.test(v) },
  { id:'number',    text:'One number',              test:(v:string)=>/[0-9]/.test(v) },
  { id:'special',   text:'One special character',   test:(v:string)=>/[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const IS:React.CSSProperties={width:'100%',padding:'14px 16px',borderRadius:'14px',border:'1.5px solid #f0f0f2',background:'#fafafa',fontSize:'0.92rem',fontWeight:600,color:'#1a1a1a',outline:'none',transition:'border-color 0.2s, box-shadow 0.2s'};
const LS:React.CSSProperties={display:'block',fontSize:'0.72rem',fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'8px'};
const FH={
  onFocus:(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>)=>{e.currentTarget.style.borderColor='var(--prime-orange)';e.currentTarget.style.boxShadow='0 0 0 3px rgba(255,140,66,0.1)';},
  onBlur: (e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>)=>{e.currentTarget.style.borderColor='#f0f0f2';e.currentTarget.style.boxShadow='none';},
};
const ss=(s:string)=>s==='active'?{color:'#10b981',bg:'rgba(16,185,129,0.08)'}:s==='inactive'?{color:'#f59e0b',bg:'rgba(245,158,11,0.08)'}:{color:'#9ca3af',bg:'rgba(107,114,128,0.08)'};
const ini=(n:string)=>n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2);
const fd=(d:string)=>new Date(d).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
const fp=(p:string)=>p?p.replace(/^\+91/,'+91 '):'—';
const ef=()=>({name:'',email:'',phone:'',dateOfBirth:'',gender:'',vehicleType:'',vehicleNumber:'',newPassword:'',changePassword:false,profilePicture:null as File|null});

const DeliveryPartnerManagement:React.FC=()=>{
  const {showToast}=useToast();
  const {user}=useAuth();
  const deliveryPerms=(user as any)?.adminStaffPermissions?.delivery;
  const canCreate=user?.role==='superadmin'||(deliveryPerms?.create===true);
  const canEdit  =user?.role==='superadmin'||(deliveryPerms?.edit===true);
  const canDelete=user?.role==='superadmin'||(deliveryPerms?.delete===true);
  const [view,setView]=useState<'list'|'profile'>('list');
  const [partners,setPartners]=useState<DeliveryPartner[]>([]);
  const [selected,setSelected]=useState<DeliveryPartner|null>(null);
  const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState<'add'|'edit'|null>(null);
  const [form,setForm]=useState(ef());
  const [saving,setSaving]=useState(false);
  const [showPwd,setShowPwd]=useState(false);
  const [search,setSearch]=useState('');
  const [confirm,setConfirm]=useState<{open:boolean;type:ActionConfirmType|null}>({open:false,type:null});
  const [toHardDel,setToHardDel]=useState<DeliveryPartner|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{setPartners(await getDeliveryPartners());}
    catch{showToast({type:'error',title:'Error',message:'Failed to load delivery partners'});}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const openAdd=()=>{setForm(ef());setSelected(null);setModal('add');};
  const openEdit=()=>{
    if(!selected)return;
    setForm({name:selected.name,email:selected.email,phone:selected.phone.replace(/^\+91\s?/,''),dateOfBirth:(selected as any).dateOfBirth?.slice(0,10)||'',gender:(selected as any).gender||'',vehicleType:selected.vehicleType||'',vehicleNumber:selected.vehicleNumber||'',newPassword:'',changePassword:false});
    setModal('edit');
  };

  const handleSave=async()=>{
    if(!form.name||!form.email||!form.phone){showToast({type:'error',title:'Validation',message:'Name, email and phone are required.'});return;}
    setSaving(true);
    try{
      if(modal==='add'){
        const p:any={name:form.name,email:form.email,phone:`+91${form.phone}`,vehicleType:form.vehicleType,vehicleNumber:form.vehicleNumber};
        if(form.dateOfBirth)p.dateOfBirth=form.dateOfBirth;
        if(form.gender)p.gender=form.gender;
        const c=await addDeliveryPartner(p);setPartners(prev=>[c,...prev]);showToast({type:'success',title:'Created',message:'Delivery partner added. Setup email sent.'});
      } else if(selected){
        const fd=new FormData();
        fd.append('name',form.name);fd.append('email',form.email);fd.append('phone',`+91${form.phone}`);
        if(form.vehicleType)fd.append('vehicleType',form.vehicleType);
        if(form.vehicleNumber)fd.append('vehicleNumber',form.vehicleNumber);
        if(form.dateOfBirth)fd.append('dateOfBirth',form.dateOfBirth);
        if(form.gender)fd.append('gender',form.gender);
        if(form.changePassword&&form.newPassword)fd.append('password',form.newPassword);
        if(form.profilePicture)fd.append('profilePicture',form.profilePicture);
        const u=await updateDeliveryPartnerForm(selected._id,fd);setPartners(prev=>prev.map(x=>x._id===selected._id?u:x));setSelected(u);showToast({type:'success',title:'Updated',message:'Delivery partner updated.'});
      }
      setModal(null);
    }catch(e:any){showToast({type:'error',title:'Error',message:e?.response?.data?.message||'Failed to save.'});}
    finally{setSaving(false);}
  };

  const handleConfirm=async()=>{
    if(!selected||!confirm.type)return;
    setConfirm({open:false,type:null});setSaving(true);
    try{
      if(confirm.type==='delete'){await deleteDeliveryPartner(selected._id);const u={...selected,status:'deleted' as any};setPartners(p=>p.map(x=>x._id===selected._id?u:x));setSelected(u);showToast({type:'success',title:'Removed',message:'Delivery partner deactivated.'});}
      else if(confirm.type==='activate'){const u=await updateDeliveryPartner(selected._id,{status:'active'});setPartners(p=>p.map(x=>x._id===selected._id?u:x));setSelected(u);showToast({type:'success',title:'Activated',message:'Account activated.'});}
      else if(confirm.type==='deactivate'){const u=await updateDeliveryPartner(selected._id,{status:'inactive'});setPartners(p=>p.map(x=>x._id===selected._id?u:x));setSelected(u);showToast({type:'success',title:'Deactivated',message:'Account deactivated.'});}
    }catch{showToast({type:'error',title:'Error',message:'Action failed.'});}
    finally{setSaving(false);}
  };

  const handleHardDelete=async()=>{
    if(!toHardDel)return;
    try{await hardDeleteDeliveryPartner(toHardDel._id);setPartners(p=>p.filter(x=>x._id!==toHardDel._id));setView('list');setSelected(null);showToast({type:'success',title:'Deleted',message:'Permanently removed.'});}
    catch{showToast({type:'error',title:'Error',message:'Failed.'});}
    finally{setToHardDel(null);}
  };

  const filtered=partners.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase()));
  const isDel=selected?.status==='deleted';

  return(
    <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{duration:0.4}} style={{maxWidth:1200,margin:'0 auto'}}>
      <PrimeLoader isLoading={saving}/>
      {loading && partners.length === 0 && (
        <PrimeLoader isLoading={true} inline />
      )}
      <ActionConfirmModal isOpen={confirm.open} actionType={confirm.type} itemName={selected?.name??''} onConfirm={handleConfirm} onCancel={()=>setConfirm({open:false,type:null})}/>
      <ActionConfirmModal isOpen={!!toHardDel} actionType="hard_delete" itemName={toHardDel?.name??''} onConfirm={handleHardDelete} onCancel={()=>setToHardDel(null)}/>

      <AnimatePresence mode="wait">
      {view==='list'?(
        <motion.div key="list" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-15}} transition={{duration:0.25}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28,flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontSize:'0.72rem',fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.8px',margin:'0 0 4px'}}>Logistics</p>
              <h2 style={{fontSize:'2rem',fontWeight:900,color:'#1a1a1a',letterSpacing:'-1px',margin:'0 0 6px'}}>Delivery Partners</h2>
              <p style={{color:'#999',fontSize:'0.9rem',fontWeight:500,margin:0}}>Manage delivery agents and assign them to orders.</p>
            </div>
            <div style={{display:'flex',gap:10}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{padding:'10px 16px',borderRadius:50,border:'1.5px solid #e5e7eb',fontSize:'0.85rem',outline:'none',width:200}}/>
              <button onClick={load} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 16px',borderRadius:50,border:'1px solid #e5e7eb',background:'#fff',color:'#666',fontWeight:700,fontSize:'0.82rem',cursor:'pointer'}}><RefreshCw size={13}/></button>
              {canCreate&&<button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 22px',borderRadius:50,border:'none',background:'var(--prime-gradient)',color:'#fff',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}><Plus size={15}/> Add Partner</button>}
            </div>
          </div>
          {partners.length===0&&!loading?(
            <div style={{textAlign:'center',padding:'80px 0',color:'#bbb'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <h3 style={{fontSize:'1.4rem',fontWeight:900,color:'#1a1a1a',marginBottom:8}}>No delivery partners yet</h3>
              <p style={{color:'#999',fontSize:'0.95rem'}}>Click "Add Partner" to create your first delivery agent.</p>
            </div>
          ):(
            <div style={{background:'#fff',borderRadius:20,border:'1px solid #f0f0f2',overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 100px',padding:'14px 24px',borderBottom:'1px solid #f0f0f2',background:'#fafafa'}}>
                {['Partner','Phone','Vehicle','Status','Joined'].map((h,i)=>(
                  <span key={h} style={{fontSize:'0.68rem',fontWeight:800,color:'#bbb',textTransform:'uppercase',letterSpacing:'1px',textAlign:i===4?'right':'left'}}>{h}</span>
                ))}
              </div>
              {filtered.map((p,i)=>{
                const st=ss(p.status);const del=p.status==='deleted';
                return(
                  <motion.div key={p._id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                    style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 100px',padding:'16px 24px',alignItems:'center',borderBottom:i<filtered.length-1?'1px solid #f5f5f7':'none',opacity:del?0.65:1,cursor:'pointer',transition:'background 0.15s'}}
                    onClick={()=>{setSelected(p);setView('profile');}}
                    onMouseEnter={e=>(e.currentTarget.style.background='#fafafa')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:42,height:42,borderRadius:'50%',background:del?'#e5e7eb':'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.8rem',color:del?'#9ca3af':'#fff',flexShrink:0}}>{ini(p.name)}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:'0.9rem',color:del?'#9ca3af':'#1a1a1a',textDecoration:del?'line-through':'none'}}>{p.name}</div>
                        <div style={{fontSize:'0.78rem',color:'#999',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.email}</div>
                      </div>
                    </div>
                    <div style={{fontSize:'0.85rem',color:'#666',fontWeight:500}}>{fp(p.phone)}</div>
                    <div style={{fontSize:'0.82rem',color:'#888'}}>{p.vehicleType?`${p.vehicleType}${p.vehicleNumber?` · ${p.vehicleNumber}`:''}` :'—'}</div>
                    <span style={{fontSize:'0.72rem',fontWeight:700,color:st.color,background:st.bg,padding:'4px 12px',borderRadius:20,textTransform:'capitalize',display:'inline-block',width:'fit-content'}}>{p.status}</span>
                    <div style={{fontSize:'0.78rem',color:'#aaa',fontWeight:500,textAlign:'right'}}>{fd(p.createdAt)}</div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      ):selected&&(
        <motion.div key="profile" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-15}} transition={{duration:0.25}}>
          <div style={{marginBottom:24}}>
            <button className="back-nav-btn" onClick={()=>setView('list')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Delivery Partners
            </button>
            <h2 style={{fontSize:'2rem',fontWeight:900,color:'#1a1a1a',letterSpacing:'-1px',marginTop:16,marginBottom:4}}>Partner Profile</h2>
            <p style={{color:'#888',fontSize:'0.95rem',fontWeight:500,margin:0}}>View details and manage account</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:24}}>
            {/* Identity */}
            <div style={{background:'#fff',borderRadius:20,border:'1px solid #f0f0f2',padding:'32px 24px',textAlign:'center'}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:isDel?'#e5e7eb':'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'1.4rem',color:isDel?'#9ca3af':'#fff',margin:'0 auto 16px',filter:isDel?'grayscale(1)':'none',overflow:'hidden'}}>
                {(selected as any).profilePicture
                  ? <img src={(selected as any).profilePicture} alt={selected.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : ini(selected.name)
                }
              </div>
              <h4 style={{fontWeight:800,color:isDel?'#9ca3af':'#1a1a1a',marginBottom:6,textDecoration:isDel?'line-through':'none'}}>{selected.name}</h4>
              <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:4}}>
                {(()=>{const st=ss(selected.status);return <span style={{fontSize:'0.72rem',fontWeight:700,color:st.color,background:st.bg,padding:'4px 14px',borderRadius:20,textTransform:'capitalize'}}>{selected.status}</span>;})()}
                <span style={{fontSize:'0.72rem',fontWeight:700,color:'#3b82f6',background:'rgba(59,130,246,0.08)',padding:'4px 14px',borderRadius:20}}>delivery</span>
              </div>
              <div style={{marginTop:28,borderTop:'1px solid #f0f0f2',paddingTop:20,display:'flex',flexDirection:'column',gap:14,textAlign:'left'}}>
                {[
                  {label:'Email',   value:selected.email},
                  {label:'Phone',   value:fp(selected.phone)},
                  {label:'Vehicle', value:selected.vehicleType?`${selected.vehicleType}${selected.vehicleNumber?` · ${selected.vehicleNumber}`:''}` :'Not provided'},
                  {label:'DOB',     value:(selected as any).dateOfBirth?fd((selected as any).dateOfBirth):'Not provided'},
                  {label:'Gender',  value:(selected as any).gender||'Not provided'},
                  {label:'Joined',  value:fd(selected.createdAt)},
                ].map(item=>(
                  <div key={item.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'0.72rem',fontWeight:800,color:'#bbb',textTransform:'uppercase',letterSpacing:'0.5px'}}>{item.label}</span>
                    <span style={{fontSize:'0.85rem',fontWeight:600,color:'#555'}}>{item.value}</span>
                  </div>
                ))}
              </div>
              {!isDel&&canEdit&&(
                <button onClick={openEdit} style={{width:'100%',marginTop:24,padding:12,borderRadius:12,border:'1.5px solid #e8e8e8',background:'#fff',color:'#1a1a1a',fontWeight:700,fontSize:'0.9rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--prime-orange)';e.currentTarget.style.color='var(--prime-orange)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8e8e8';e.currentTarget.style.color='#1a1a1a';}}>
                  <Edit2 size={16}/> Edit Profile
                </button>
              )}
            </div>

            {/* Right */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {!isDel&&(
                <div style={{background:'#fff',borderRadius:20,border:'1px solid #f0f0f2',padding:28}}>
                  <h5 style={{fontWeight:800,color:'#1a1a1a',fontSize:'1rem',marginBottom:4}}>Account Actions</h5>
                  <p style={{color:'#aaa',fontSize:'0.82rem',margin:'0 0 20px'}}>Change account status</p>
                  <div style={{height:1,background:'#f0f0f2',marginBottom:20}}/>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {selected.status!=='active'&&(
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderRadius:14,border:'1px solid #f0f0f2',background:'#fafafa'}}>
                        <div><div style={{fontWeight:700,color:'#1a1a1a',fontSize:'0.9rem'}}>Activate Account</div><div style={{fontSize:'0.78rem',color:'#aaa',marginTop:2}}>Allow deliveries</div></div>
                        <button onClick={()=>setConfirm({open:true,type:'activate'})} style={{padding:'9px 18px',borderRadius:10,border:'1.5px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.06)',color:'#10b981',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}
                          onMouseEnter={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(16,185,129,0.06)';e.currentTarget.style.color='#10b981';}}>
                          <Unlock size={13}/> Activate
                        </button>
                      </div>
                    )}
                    {selected.status!=='inactive'&&(
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderRadius:14,border:'1px solid #f0f0f2',background:'#fafafa'}}>
                        <div><div style={{fontWeight:700,color:'#1a1a1a',fontSize:'0.9rem'}}>Deactivate Account</div><div style={{fontSize:'0.78rem',color:'#aaa',marginTop:2}}>Suspend deliveries temporarily</div></div>
                        <button onClick={()=>setConfirm({open:true,type:'deactivate'})} style={{padding:'9px 18px',borderRadius:10,border:'1.5px solid rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.06)',color:'#f59e0b',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}
                          onMouseEnter={e=>{e.currentTarget.style.background='#f59e0b';e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(245,158,11,0.06)';e.currentTarget.style.color='#f59e0b';}}>
                          <Lock size={13}/> Deactivate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!isDel&&canDelete&&(
                <div style={{background:'rgba(239,68,68,0.02)',borderRadius:20,border:'1px solid rgba(239,68,68,0.12)',padding:28}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><AlertTriangle size={17} color="#ef4444"/><h5 style={{fontWeight:800,color:'#ef4444',fontSize:'1rem',margin:0}}>Danger Zone</h5></div>
                  <p style={{color:'#999',fontSize:'0.82rem',margin:'0 0 18px',lineHeight:1.6}}>Remove this delivery partner. You can permanently delete afterwards.</p>
                  <button onClick={()=>setConfirm({open:true,type:'delete'})} style={{padding:'10px 22px',borderRadius:10,border:'1.5px solid rgba(239,68,68,0.4)',background:'transparent',color:'#ef4444',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.06)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                    <Trash2 size={14}/> Remove Account
                  </button>
                </div>
              )}
              {isDel&&(
                <div style={{background:'rgba(239,68,68,0.02)',borderRadius:20,border:'1px solid rgba(239,68,68,0.12)',padding:28}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><AlertTriangle size={17} color="#ef4444"/><h5 style={{fontWeight:800,color:'#ef4444',fontSize:'1rem',margin:0}}>Danger Zone</h5></div>
                  <p style={{color:'#999',fontSize:'0.82rem',margin:'0 0 18px',lineHeight:1.6}}>Permanently erase this account.</p>
                  <div style={{display:'flex',gap:12}}>
                    <button onClick={async()=>{setSaving(true);try{const u=await updateDeliveryPartner(selected._id,{status:'active'});setPartners(p=>p.map(x=>x._id===selected._id?u:x));setSelected(u);showToast({type:'success',title:'Restored',message:'Account restored.'});}catch{showToast({type:'error',title:'Error',message:'Failed.'});}finally{setSaving(false);}}}
                      style={{padding:'10px 22px',borderRadius:10,border:'1.5px solid rgba(16,185,129,0.4)',background:'transparent',color:'#10b981',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(16,185,129,0.06)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                      <RotateCcw size={14}/> Restore Account
                    </button>
                    {canDelete&&<button onClick={()=>setToHardDel(selected)} style={{padding:'10px 22px',borderRadius:10,border:'1.5px solid rgba(239,68,68,0.4)',background:'transparent',color:'#ef4444',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.06)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                      <Trash2 size={14}/> Delete Permanently
                    </button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
            onClick={()=>setModal(null)}>
            <motion.div initial={{scale:0.88,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.88,opacity:0,y:20}}
              style={{background:'#fff',borderRadius:24,width:'100%',maxWidth:680,maxHeight:'90vh',display:'flex',flexDirection:'column',border:'1px solid #f0f0f2'}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 28px 20px',borderBottom:'1px solid #f0f0f2',flexShrink:0}}>
                <div>
                  <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'#1a1a1a',letterSpacing:'-0.5px',margin:0}}>{modal==='add'?'New Delivery Partner':'Edit Partner'}</h2>
                  <p style={{color:'#888',fontSize:'0.9rem',margin:'4px 0 0'}}>{modal==='add'?'Create a delivery agent account':'Update partner details'}</p>
                </div>
                <button onClick={()=>setModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#999',padding:8}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{overflowY:'auto',flex:1,padding:'24px 28px',display:'flex',flexDirection:'column',gap:20}}>
                <div><label style={LS}>Full Name *</label><input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={IS} placeholder="e.g. Ravi Kumar" {...FH}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <div><label style={LS}>Email *</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={IS} placeholder="partner@example.com" {...FH}/></div>
                  <div>
                    <label style={LS}>Phone *</label>
                    <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                      <div style={{position:'absolute',left:14,display:'flex',alignItems:'center',gap:8,fontSize:'0.92rem',fontWeight:600,color:'#555',pointerEvents:'none'}}>
                        <span style={{fontSize:'1.1rem'}}>🇮🇳</span><span>+91</span><div style={{width:1.5,height:18,background:'#e0e0e0',marginLeft:2}}/>
                      </div>
                      <input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} style={{...IS,paddingLeft:92}} placeholder="10-digit number" {...FH}/>
                    </div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <div><label style={LS}>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e=>setForm(p=>({...p,dateOfBirth:e.target.value}))} style={IS} {...FH}/></div>
                  <div><label style={LS}>Gender</label>
                    <select value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))} style={{...IS,background:'#fafafa'}} {...FH}>
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <div><label style={LS}>Vehicle Type</label><input type="text" value={form.vehicleType} onChange={e=>setForm(p=>({...p,vehicleType:e.target.value}))} style={IS} placeholder="e.g. Bike, Van" {...FH}/></div>
                  <div><label style={LS}>Vehicle Number</label><input type="text" value={form.vehicleNumber} onChange={e=>setForm(p=>({...p,vehicleNumber:e.target.value}))} style={IS} placeholder="e.g. TN01AB1234" {...FH}/></div>
                </div>
                {modal==='edit'&&(
                  <div>
                    <button type="button" onClick={()=>setForm(p=>({...p,changePassword:!p.changePassword,newPassword:''}))}
                      style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'1.5px solid #f0f0f2',borderRadius:12,padding:'10px 16px',cursor:'pointer',fontSize:'0.85rem',fontWeight:700,color:form.changePassword?'var(--prime-orange)':'#555',transition:'all 0.2s'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {form.changePassword?'Cancel password change':'Change password'}
                    </button>
                    <AnimatePresence>
                      {form.changePassword&&(
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden'}}>
                          <div style={{paddingTop:16}}>
                            <label style={LS}>New Password *</label>
                            <div style={{position:'relative'}}>
                              <input type={showPwd?'text':'password'} value={form.newPassword} onChange={e=>setForm(p=>({...p,newPassword:e.target.value}))} style={{...IS,paddingRight:44}} placeholder="Enter new password" {...FH}/>
                              <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#999'}}>
                                {showPwd?<EyeOff size={18}/>:<Eye size={18}/>}
                              </button>
                            </div>
                            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px'}}>
                              {pwdRules.map(r=>{const ok=r.test(form.newPassword);return(
                                <div key={r.id} style={{display:'flex',alignItems:'center',fontSize:'0.8rem',color:ok?'#10b981':'#aaa',fontWeight:ok?600:500,transition:'color 0.3s'}}>
                                  {ok?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
                                    :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,flexShrink:0}}><circle cx="12" cy="12" r="10"/></svg>}
                                  {r.text}
                                </div>
                              );})}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {modal==='add'&&(
                  <div style={{display:'flex',alignItems:'flex-start',gap:12,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:'16px 18px'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div><p style={{margin:'0 0 4px',fontSize:'0.82rem',fontWeight:800,color:'#15803d'}}>Password setup via email</p><p style={{margin:0,fontSize:'0.8rem',color:'#166534',lineHeight:1.5}}>A secure setup link will be emailed. They'll set their own password.</p></div>
                  </div>
                )}
                {modal==='edit'&&(
                  <div>
                    <label style={LS}>Profile Picture</label>
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                      {form.profilePicture
                        ? <img src={URL.createObjectURL(form.profilePicture)} alt="preview" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid #f0f0f2'}}/>
                        : selected?.profilePicture
                          ? <img src={(selected as any).profilePicture} alt="current" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid #f0f0f2'}}/>
                          : <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:'1rem'}}>{selected?.name?.split(' ').map((x:string)=>x[0]).join('').toUpperCase().slice(0,2)}</div>
                      }
                      <label style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'#fff',color:'#555',fontWeight:700,fontSize:'0.82rem',cursor:'pointer'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Photo
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setForm(p=>({...p,profilePicture:e.target.files?.[0]||null}))}/>
                      </label>
                      {form.profilePicture&&<button type="button" onClick={()=>setForm(p=>({...p,profilePicture:null}))} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:'0.78rem',fontWeight:700}}>Remove</button>}
                    </div>
                  </div>
                )}
              </div>
              <div style={{padding:'16px 28px',borderTop:'1px solid #f0f0f2',display:'flex',gap:10,justifyContent:'flex-end',flexShrink:0}}>
                <button onClick={()=>setModal(null)} style={{padding:'12px 24px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'#fff',color:'#555',fontWeight:700,fontSize:'0.88rem',cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{padding:'12px 28px',borderRadius:50,border:'none',background:'var(--prime-gradient)',color:'#fff',fontWeight:700,fontSize:'0.88rem',cursor:'pointer',opacity:saving?0.7:1}}>
                  {saving?'Saving...':modal==='add'?'Create Partner':'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DeliveryPartnerManagement;


