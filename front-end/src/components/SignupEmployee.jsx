import React from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBCheckbox
} from 'mdb-react-ui-kit';

function SignupEmployee() {
  return (
    <MDBContainer fluid className='h-custom'>
      <MDBRow className='d-flex justify-content-center align-items-center h-100'>
        <MDBCol col='12' className='m-5'>

          <MDBCard className='card-registration card-registration-2' style={{ borderRadius: '15px' }}>
            <MDBCardBody className='p-0'>

              <MDBRow>

                <MDBCol md='6' className='p-5 bg-white'>
                  <h3 className="fw-normal mb-5" style={{ color: '#4835d4' }}>General Information</h3>

                  {/* Title Select */}
                  <div className='mb-4'>
                    <label className='form-label'>Title</label>
                    <select className='form-select' size='lg'>
                      <option value="1">Title</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                      <option value="4">Four</option>
                    </select>
                  </div>

                  <MDBRow>
                    <MDBCol md='6'>
                      <MDBInput wrapperClass='mb-4' label='First Name' size='lg' id='form1' type='text' />
                    </MDBCol>
                    <MDBCol md='6'>
                      <MDBInput wrapperClass='mb-4' label='Last Name' size='lg' id='form2' type='text' />
                    </MDBCol>
                  </MDBRow>

                  {/* Position Select */}
                  <div className='mb-4'>
                    <label className='form-label'>Position</label>
                    <select className='form-select' size='lg'>
                      <option value="1">Position</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                      <option value="4">Four</option>
                    </select>
                  </div>

                  <MDBInput wrapperClass='mb-4' label='Position' size='lg' id='form3' type='text' />

                  <MDBRow>
                    <MDBCol md='6'>
                      <MDBInput wrapperClass='mb-4' label='Business Arena' size='lg' id='form4' type='text' />
                    </MDBCol>

                    <MDBCol md='6'>
                      <div className='mb-4'>
                        <label className='form-label'>Employees</label>
                        <select className='form-select' size='lg'>
                          <option value="1">Employees</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                          <option value="4">Four</option>
                        </select>
                      </div>
                    </MDBCol>
                  </MDBRow>
                </MDBCol>

                <MDBCol md='6' className='bg-indigo p-5'>
                  <h3 className="fw-normal mb-5 text-white">Contact Details</h3>

                  <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Street + Nr' size='lg' id='form5' type='text' />
                  <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Additional Information' size='lg' id='form6' type='text' />

                  <MDBRow>
                    <MDBCol md='5'>
                      <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Zip Code' size='lg' id='form7' type='text' />
                    </MDBCol>
                    <MDBCol md='7'>
                      <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Place' size='lg' id='form8' type='text' />
                    </MDBCol>
                  </MDBRow>

                  <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Country' size='lg' id='form9' type='text' />

                  <MDBRow>
                    <MDBCol md='5'>
                      <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Code +' size='lg' id='form10' type='text' />
                    </MDBCol>
                    <MDBCol md='7'>
                      <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Phone Number' size='lg' id='form11' type='text' />
                    </MDBCol>
                  </MDBRow>

                  <MDBInput wrapperClass='mb-4' labelClass='text-white' label='Your Email' size='lg' id='form12' type='email' />
                  <MDBCheckbox name='flexCheck' id='flexCheckDefault' labelClass='text-white mb-4' label='I do accept the Terms and Conditions of your site.' />
                  <MDBBtn color='light' size='lg'>Register</MDBBtn>
                </MDBCol>

              </MDBRow>
            </MDBCardBody>
          </MDBCard>

        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default SignupEmployee;
