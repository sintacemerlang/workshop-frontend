import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, CardHeader, Col, Form, Modal, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import MySwal from "../../utils/MySwal";

const User = () => {
    const sw = new MySwal()
    const [data, setData] = useState([]) //panggil variabel dari API
    const [isInit, setIsInit] = useState(true) //untuk stop looping
    const [showModal, setShowModal] = useState(false) //menampilkan modal tambah
    const [form, setForm] = useState({
        idUser: '',
        namaUser: '',
        username: '',
        password: '',
        level: 0
    })
    

    const columns = [
        {
            name: 'Nama',
            selector: row => row.nama,
            sortable: true,
        },
        {
            name: 'Username',
            selector: row => row.username,
            sortable: true,
        },
        {
            name: 'Level',
            selector: row => row.level,
            sortable: true,
        },
        // aksi untuk delete dan edit
        {
            name: 'Actions',
            cell: row =>  (<>
                <Button variant='outline-success' onClick={() => handleClickModal(row)}>
                    <i className="bi bi-pencil-square"></i>
                </Button>
                <Button variant='outline-danger' onClick={() => handleClickDelete(row)}>
                    <i className="bi bi-trash"></i>
                </Button>
            </>)
        }
    ];

    const getData = useCallback(async() => {
        await axios.get('http://localhost:8000/api/getAllUser')
        .then((response) => {
            setIsInit(false)
            setData((prevState) => {
                return response.data.data
            })
        })
    }, [])

    const handleClickModal = useCallback((row) => {
        if(row){
            setForm({
                idUser : row.id_user,
                namaUser: row.nama,
                username: row.username,
                password: row.password,
                level: row.level
            })
        }

        if (!showModal === false){
            setForm({
                namaUser: '',
                username: '',
                password: '',
                level: 0
            }) 
        }
        setShowModal(!showModal)
    }, [showModal])

    const handleChange = useCallback((event) => {
        // console.log(form.username)
        setForm((prevState) => {
            return {
                ...prevState,
                [event.target.name]: event.target.value
            }
        })
    }, [])

    const handleClickSave = useCallback(async () => {
        if (form.namaUser && form.username && form.password && form.level){
            if (form.idUser){
                //untuk edit
                await axios.put('http://localhost:8000/api/updateUser', {
                    id_user : form.idUser,
                    nama: form.namaUser,
                    username: form.username,
                    password: form.password,
                    level: form.level,
                })
            .then((response) => {
                console.log(response)
                if (response.status === 200){
                    sw.success('Berhasil Mengubah User')
                    handleClickModal()
                    setIsInit(true)
                    setForm({
                        idUser: '',
                        namaUser: '',
                        username: '',
                        password: '',
                        level: 0
                    })
                }
            })
            }else{
                //untuk tambah
                await axios.post('http://localhost:8000/api/createUser', {
                nama: form.namaUser,
                username: form.username,
                password: form.password,
                level: form.level,
                })
                .then((response) => {
                console.log(response)
                if (response.status === 200){
                    sw.success('Berhasil Menambahkan User')
                    handleClickModal()
                    setIsInit(true)
                    setForm({
                        namaUser: '',
                        username: '',
                        password: '',
                        level: 0
                    })
                }
            })   
            }
        }else{
            sw.warning('Mohon isi semua field')
        }
        
    }, [form.namaUser, form.username, form.password, form.level])

    const handleClickDelete = useCallback((row) => {
        sw.confirm('Apakah Anda yakin ingin menghapus data ini')
        .then(async isConfirm => {
            if(isConfirm.value){
                await axios.delete('http://localhost:8000/api/deleteUser', {
                params:{
                    id_user: row.id_user,
                }
                })
                .then((response) => {
                console.log(response)
                if (response.status === 200){
                    sw.success('Berhasil Menghapus User')
                    setIsInit(true)
                }
            })   
            }
        })
    }, [])

    useEffect(() => {
        if(isInit){
            getData()
        }
    }, [getData, isInit])

    return (
        <div>
            <Card>
                <CardHeader>
                    <Row>
                        <Col className='d-flex justify-content-start'>
                            User Page
                        </Col>
                        <Col className='d-flex justify-content-end'>
                            <Button variant='outline-primary' onClick={() => handleClickModal()}>
                                Create New
                            </Button>
                        </Col>
                    </Row>

                </CardHeader>
                <Card.Body>
                    <DataTable
                        columns={columns}
                        data={data}
                    />
                </Card.Body>
                
            </Card>

            {/* modal tambah */}
            <Modal
                show={showModal}
                onHide={() => handleClickModal()}
            >
                <Modal.Body>
                <Form.Group className='py-2'>
                        <Form.Label>
                            Nama User
                        </Form.Label>
                        <Form.Control value={form.namaUser} name='namaUser' type='text' placeholder='Masukkan Nama User' onChange={(e) => handleChange(e)}/>
                    </Form.Group>
                    <Form.Group className='py-2'>
                        <Form.Label>
                            Username
                        </Form.Label>
                        <Form.Control value={form.username} type='text' name='username' placeholder='Masukkan Username' onChange={(e) => handleChange(e)}/>
                    </Form.Group>
                    <Form.Group className='py-2'>
                        <Form.Label>
                            Password
                        </Form.Label>
                        <Form.Control value={form.password} type='password' name='password' placeholder='Masukkan Password' onChange={(e) => handleChange(e)}/>
                    </Form.Group>
                    <Form.Group className='py-2'>
                        <Form.Label>
                            Level
                        </Form.Label>
                        <Form.Control value={form.level} max={3} type='number' name='level' placeholder='Masukkan Level User' onChange={(e) => handleChange(e)}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Col className='d-flex justify-content-end'>
                        <Button variant='outline-danger' type='button' className='mx-3' onClick={() => handleClickModal()}>
                            Cancel
                        </Button>
                        <Button variant='outline-primary' type='button' className='' onClick={() => handleClickSave()}>
                            Save
                        </Button>
                    </Col>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default User