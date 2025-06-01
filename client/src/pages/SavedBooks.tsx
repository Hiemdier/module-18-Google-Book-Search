import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User'; 
import type { Book } from '../models/Book';

const SavedBooks: React.FC = () => {
  const { loading, data, error } = useQuery<{ me: User }>(GET_ME);

  const [removeBook] = useMutation<{ removeBook: User }, { bookId: string }>(
    REMOVE_BOOK,
    {
      update(cache, { data }) {
        if (!data) return;
        cache.writeQuery({
          query: GET_ME,
          data: { me: data.removeBook },
        });
      },
      onError(err) {
        console.error('Mutation error:', err);
      },
    }
  );

  const userData = data?.me || {
    username: null,
    email: null,
    password: null,
    savedBooks: [],
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      if (!Auth.loggedIn()) {
        alert('You must be logged in to delete a book.');
        return;
      }

      await removeBook({
        variables: { bookId },
      });

      removeBookId(bookId);
    } catch (err) {
      console.error('Failed to delete book:', err);
      alert('Failed to delete the book. Please try again.');
    }
  };

  if (loading) return <h2>LOADING...</h2>;

  if (error) return <h2>Error loading user data: {error.message}</h2>;

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => (
            <Col key={book.bookId} md='4'>
              <Card border='dark'>
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant='top'
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className='btn-block btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
