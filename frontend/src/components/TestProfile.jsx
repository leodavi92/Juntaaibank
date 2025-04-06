import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TestProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user profile data when component mounts
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users/${user.userId}`);
        console.log('Profile data fetched:', response.data);
        
        // Update profile state with fetched data
        setProfile({
          fullName: response.data.name || '',
          phone: response.data.phone || '',
          cpf: response.data.cpf || '',
          birthDate: response.data.birthDate || '',
          address: response.data.address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userId) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Enviando dados para atualização:', profile);
      
      // Make sure we're sending the right data format
      const profileData = {
        phone: profile.phone,
        cpf: profile.cpf,
        birthDate: profile.birthDate,
        address: profile.address
      };
      
      const response = await api.put('/api/test-update-profile', profileData);
      
      console.log('Resposta da atualização:', response.data);
      
      // Verificar se os dados foram atualizados corretamente
      if (response.data) {
        console.log('Perfil atualizado com sucesso!');
        console.log('Dados atualizados:', {
          phone: response.data.phone,
          cpf: response.data.cpf,
          birthDate: response.data.birthDate,
          address: response.data.address
        });
        
        // Store the updated data in local storage to persist between page reloads
        localStorage.setItem('userProfile', JSON.stringify(response.data));
        
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load profile from localStorage on initial render
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      console.log('Loading saved profile from localStorage:', parsedProfile);
      
      // Update profile with saved data
      setProfile(prev => ({
        ...prev,
        phone: parsedProfile.phone || prev.phone,
        cpf: parsedProfile.cpf || prev.cpf,
        birthDate: parsedProfile.birthDate || prev.birthDate,
        address: parsedProfile.address || prev.address
      }));
    }
  }, []);

  return (
    <div className="container mt-5">
      <h2>Update Profile</h2>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpf" className="form-label">CPF</label>
          <input
            type="text"
            className="form-control"
            id="cpf"
            name="cpf"
            value={profile.cpf}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="birthDate" className="form-label">Birth Date</label>
          <input
            type="date"
            className="form-control"
            id="birthDate"
            name="birthDate"
            value={profile.birthDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      <div className="mt-4">
        <h3>Current Profile Data:</h3>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestProfile;